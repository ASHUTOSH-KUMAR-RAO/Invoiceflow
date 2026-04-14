import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { clientSchema } from "@/lib/validations"

// GET — saare clients fetch karo
export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const where = {
      userId: session.user.id,
      isActive: true,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
          { phone: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    }

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          _count: { select: { invoices: true } },
          invoices: {
            select: { total: true, status: true },
          },
        },
      }),
      prisma.client.count({ where }),
    ])

    return NextResponse.json({
      data: clients,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }, { status: 200 })
  } catch (error) {
    console.error("GET clients error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// POST — naya client banao
export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const parsed = clientSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.errors },
        { status: 400 }
      )
    }

    const client = await prisma.client.create({
      data: {
        ...parsed.data,
        userId: session.user.id,
        email: parsed.data.email || null,
        phone: parsed.data.phone || null,
        gstin: parsed.data.gstin || null,
        pan: parsed.data.pan || null,
        address: parsed.data.address || null,
        city: parsed.data.city || null,
        state: parsed.data.state || null,
        pincode: parsed.data.pincode || null,
        notes: parsed.data.notes || null,
      },
    })

    return NextResponse.json({ data: client }, { status: 201 })
  } catch (error) {
    console.error("POST client error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
