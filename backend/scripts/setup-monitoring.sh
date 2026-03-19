#!/bin/bash

# Monitoring Setup Script for Market Intelligence Module
# Sets up comprehensive monitoring and alerting

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
GRAFANA_ADMIN_PASSWORD="admin123"
PROMETHEUS_PORT="9090"
GRAFANA_PORT="3001"
APP_PORT="3000"

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
    
    # Check if the app is running
    if ! curl -f http://localhost:$APP_PORT/api/health > /dev/null 2>&1; then
        log_error "Application is not running on port $APP_PORT"
        exit 1
    fi
    
    log_info "Prerequisites check passed"
}

# Create monitoring configuration
create_monitoring_config() {
    log_info "Creating monitoring configuration..."
    
    # Create monitoring directory
    mkdir -p monitoring/{prometheus,grafana,alerts}
    
    # Prometheus configuration
    cat > monitoring/prometheus/prometheus.yml << EOF
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'market-intelligence'
    static_configs:
      - targets: ['host.docker.internal:$APP_PORT']
    metrics_path: '/api/metrics'
    scrape_interval: 30s

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'postgres-exporter'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis-exporter'
    static_configs:
      - targets: ['redis-exporter:9121']
EOF

    # Alert rules
    cat > monitoring/prometheus/alert_rules.yml << EOF
groups:
  - name: market_intelligence_alerts
    rules:
      - alert: HighErrorRate
        expr: error_rate_5m > 0.05
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ \$value }} for the last 5 minutes"

      - alert: HighResponseTime
        expr: response_time_seconds > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
          description: "Response time is {{ \$value }} seconds"

      - alert: LowCacheHitRatio
        expr: cache_hit_ratio < 0.8
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Low cache hit ratio"
          description: "Cache hit ratio is {{ \$value }}"

      - alert: DatabaseConnectionsHigh
        expr: database_connections_active > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High database connections"
          description: "{{ \$value }} active database connections"

      - alert: ApplicationDown
        expr: up{job="market-intelligence"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Application is down"
          description: "Market Intelligence application is not responding"
EOF

    # Grafana datasources
    cat > monitoring/grafana/datasources.yml << EOF
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:$PROMETHEUS_PORT
    isDefault: true
    editable: true

  - name: Loki
    type: loki
    access: proxy
    url: http://loki:3100
    editable: true
EOF

    # Grafana dashboard configuration
    cat > monitoring/grafana/dashboards.yml << EOF
apiVersion: 1

providers:
  - name: 'market-intelligence'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /etc/grafana/provisioning/dashboards
EOF

    log_info "Monitoring configuration created"
}

# Create Docker Compose for monitoring
create_monitoring_docker_compose() {
    log_info "Creating monitoring Docker Compose..."
    
    cat > docker-compose.monitoring.yml << EOF
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    ports:
      - "$PROMETHEUS_PORT:9090"
    volumes:
      - ./monitoring/prometheus:/etc/prometheus
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'
    restart: unless-stopped
    networks:
      - monitoring

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "$GRAFANA_PORT:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=$GRAFANA_ADMIN_PASSWORD
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana:/etc/grafana/provisioning
    restart: unless-stopped
    networks:
      - monitoring

  node-exporter:
    image: prom/node-exporter:latest
    container_name: node-exporter
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    restart: unless-stopped
    networks:
      - monitoring

  alertmanager:
    image: prom/alertmanager:latest
    container_name: alertmanager
    ports:
      - "9093:9093"
    volumes:
      - ./monitoring/alerts:/etc/alertmanager
      - alertmanager_data:/alertmanager
    restart: unless-stopped
    networks:
      - monitoring

  loki:
    image: grafana/loki:latest
    container_name: loki
    ports:
      - "3100:3100"
    volumes:
      - ./monitoring/loki:/etc/loki
      - loki_data:/loki
    command: -config.file=/etc/loki/local-config.yaml
    restart: unless-stopped
    networks:
      - monitoring

  promtail:
    image: grafana/promtail:latest
    container_name: promtail
    volumes:
      - ./monitoring/promtail:/etc/promtail
      - /var/log:/var/log:ro
    command: -config.file=/etc/promtail/config.yml
    restart: unless-stopped
    networks:
      - monitoring

volumes:
  prometheus_data:
  grafana_data:
  alertmanager_data:
  loki_data:

networks:
  monitoring:
    driver: bridge
EOF

    log_info "Monitoring Docker Compose created"
}

# Setup Loki configuration
setup_loki() {
    log_info "Setting up Loki configuration..."
    
    mkdir -p monitoring/loki
    mkdir -p monitoring/promtail
    
    # Loki config
    cat > monitoring/loki/local-config.yaml << EOF
auth_enabled: false

server:
  http_listen_port: 3100

ingester:
  lifecycler:
    address: 127.0.0.1
    ring:
      kvstore:
        store: inmemory
      replication_factor: 1
    final_sleep: 0s
  chunk_idle_period: 1h
  max_chunk_age: 1h
  chunk_target_size: 1048576
  chunk_retain_period: 30s

schema_config:
  configs:
    - from: 2020-10-24
      store: boltdb-shipper
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 24h

storage_config:
  boltdb_shipper:
    active_index_directory: /loki/boltdb-shipper-active
    cache_location: /loki/boltdb-shipper-cache
    shared_store: filesystem
  filesystem:
    directory: /loki/chunks

limits_config:
  enforce_metric_name: false
  reject_old_samples: true
  reject_old_samples_max_age: 168h

chunk_store_config:
  max_look_back_period: 0s

table_manager:
  retention_deletes_enabled: false
  retention_period: 0s
EOF

    # Promtail config
    cat > monitoring/promtail/config.yml << EOF
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  - job_name: containers
    static_configs:
      - targets:
          - localhost
        labels:
          job: containerlogs
          __path__: /var/log/containers/*log
    pipeline_stages:
      - json:
          expressions:
            output: log
            stream: stream
            attrs:
      - json:
          expressions:
            tag:
          source: attrs
      - regex:
          expression: (?P<container_name>(?:[^|]*))\|
          source: tag
      - timestamp:
          format: RFC3339Nano
          source: time
      - labels:
          stream:
          container_name:
      - output:
          source: output
EOF

    log_info "Loki configuration setup completed"
}

# Start monitoring services
start_monitoring() {
    log_info "Starting monitoring services..."
    
    # Start monitoring stack
    docker-compose -f docker-compose.monitoring.yml up -d
    
    # Wait for services to be ready
    log_info "Waiting for services to start..."
    sleep 30
    
    # Check if services are running
    if curl -f http://localhost:$PROMETHEUS_PORT > /dev/null 2>&1; then
        log_info "Prometheus is running on port $PROMETHEUS_PORT"
    else
        log_error "Prometheus failed to start"
        exit 1
    fi
    
    if curl -f http://localhost:$GRAFANA_PORT > /dev/null 2>&1; then
        log_info "Grafana is running on port $GRAFANA_PORT"
    else
        log_error "Grafana failed to start"
        exit 1
    fi
    
    log_info "Monitoring services started successfully"
}

# Setup alerts and notifications
setup_alerts() {
    log_info "Setting up alert configuration..."
    
    mkdir -p monitoring/alerts
    
    # Alertmanager configuration
    cat > monitoring/alerts/alertmanager.yml << EOF
global:
  smtp_smarthost: 'localhost:587'
  smtp_from: 'alerts@your-domain.com'

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'web.hook'

receivers:
  - name: 'web.hook'
    webhook_configs:
      - url: 'http://localhost:5001/'
    email_configs:
      - to: 'admin@your-domain.com'
        subject: '[Market Intelligence Alert] {{ .GroupLabels.alertname }}'
        body: |
          {{ range .Alerts }}
          Alert: {{ .Annotations.summary }}
          Description: {{ .Annotations.description }}
          Labels: {{ range .Labels.SortedPairs }}{{ .Name }}={{ .Value }} {{ end }}
          {{ end }}

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'dev', 'instance']
EOF

    log_info "Alert configuration setup completed"
}

# Create monitoring dashboard
create_dashboard() {
    log_info "Creating monitoring dashboard..."
    
    mkdir -p monitoring/grafana/dashboards
    
    # Market Intelligence dashboard
    cat > monitoring/grafana/dashboards/market-intelligence.json << EOF
{
  "dashboard": {
    "id": null,
    "title": "Market Intelligence Dashboard",
    "tags": ["market-intelligence"],
    "timezone": "browser",
    "panels": [
      {
        "title": "Application Status",
        "type": "stat",
        "targets": [
          {
            "expr": "up{job=&quot;market-intelligence&quot;}",
            "legendFormat": "{{instance}}"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "mappings": [
              {"options": {"0": {"text": "DOWN", "color": "red"}}, "type": "value"},
              {"options": {"1": {"text": "UP", "color": "green"}}, "type": "value"}
            ]
          }
        },
        "gridPos": {"h": 8, "w": 6, "x": 0, "y": 0}
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "response_time_seconds",
            "legendFormat": "Response Time"
          }
        ],
        "gridPos": {"h": 8, "w": 12, "x": 6, "y": 0}
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "error_rate_5m * 100",
            "legendFormat": "Error Rate %"
          }
        ],
        "gridPos": {"h": 8, "w": 6, "x": 18, "y": 0}
      },
      {
        "title": "Active Users",
        "type": "stat",
        "targets": [
          {
            "expr": "market_intelligence_active_users",
            "legendFormat": "Active Users"
          }
        ],
        "gridPos": {"h": 8, "w": 6, "x": 0, "y": 8}
      },
      {
        "title": "API Calls",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(market_intelligence_api_calls_total[5m])",
            "legendFormat": "API Calls/sec"
          }
        ],
        "gridPos": {"h": 8, "w": 12, "x": 6, "y": 8}
      },
      {
        "title": "Cache Hit Ratio",
        "type": "stat",
        "targets": [
          {
            "expr": "cache_hit_ratio * 100",
            "legendFormat": "Cache Hit %"
          }
        ],
        "gridPos": {"h": 8, "w": 6, "x": 18, "y": 8}
      }
    ],
    "time": {"from": "now-1h", "to": "now"},
    "refresh": "30s"
  }
}
EOF

    log_info "Monitoring dashboard created"
}

# Main function
main() {
    log_info "Setting up monitoring for Market Intelligence Module..."
    
    check_prerequisites
    create_monitoring_config
    create_monitoring_docker_compose
    setup_loki
    setup_alerts
    create_dashboard
    start_monitoring
    
    log_info "🎉 Monitoring setup completed!"
    log_info "Grafana Dashboard: http://localhost:$GRAFANA_PORT (admin/$GRAFANA_ADMIN_PASSWORD)"
    log_info "Prometheus: http://localhost:$PROMETHEUS_PORT"
    log_info "AlertManager: http://localhost:9093"
    
    log_info "\nNext steps:"
    log_info "1. Configure notification channels in AlertManager"
    log_info "2. Import additional dashboards to Grafana"
    log_info "3. Set up custom alert rules as needed"
    log_info "4. Configure log retention policies"
}

# Run main function
main "$@"