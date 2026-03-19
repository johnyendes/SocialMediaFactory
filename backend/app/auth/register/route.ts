import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'USER' // Default role, can be upgraded to ADMIN later
      }
    });

    // Create user preferences
    await prisma.userPreferences.create({
      data: {
        userId: user.id,
        theme: 'light',
        defaultDashboard: 'overview',
        emailNotifications: true
      }
    });

    // Get default organization
    let organization = await prisma.organization.findFirst({
      where: { isActive: true }
    });

    // If no organization exists, create a default one
    if (!organization) {
      organization = await prisma.organization.create({
        data: {
          name: 'Default Organization',
          slug: 'default-org',
          isActive: true,
          theme: JSON.stringify({
            primaryColor: '#2563eb',
            secondaryColor: '#64748b'
          }),
          settings: JSON.stringify({
            welcomeMessage: 'Welcome to the platform',
            loginButtonText: 'Sign In'
          })
        }
      });
    }

    // Link user to organization
    await prisma.user.update({
      where: { id: user.id },
      data: { organizationId: organization.id }
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}