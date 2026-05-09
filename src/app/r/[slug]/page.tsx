import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import CustomerPage from './CustomerPage'

interface Props {
  params: { slug: string }
  searchParams: { qr?: string; type?: string; table?: string }
}

export default async function RestaurantPage({ params, searchParams }: Props) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: params.slug, isActive: true },
    include: {
      menuCategories: {
        where: { isActive: true },
        include: {
          items: {
            where: { isAvailable: true },
            orderBy: { sortOrder: 'asc' },
          },
        },
        orderBy: { sortOrder: 'asc' },
      },
      offers: { where: { isActive: true } },
    },
  })

  if (!restaurant) notFound()

  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><div className="text-3xl animate-pulse">🍽️</div></div>}>
      <CustomerPage
        restaurant={restaurant}
        qrId={searchParams.qr}
        qrType={searchParams.type}
        tableNumber={searchParams.table}
      />
    </Suspense>
  )
}
