import { auth } from "@clerk/nextjs"
import { redirect } from "next/navigation"

import type { BillboardColumn } from "./components/columns"
import { DataTable } from "@/components/ui/data-table"
import { db } from "@/lib/db"
import { format } from "date-fns"

const PhotographerPage = async ({
  params,
}: {
  params: { storeId: string }
}) => {
  const { userId } = auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const photographers = await db.photographer.findMany({
    where: {
      storeId: params.storeId,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  const formattedPhotographers: BillboardColumn[] = photographers.map((item) => ({
    id: item.id,
    name: item.name,
    createdAt: format(item.createdAt, "MMMM do, yyyy"),
  }))

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <DataTable searchKey="name" columns={columns} data={formattedPhotographers} />
      </div>
    </div>
  )
}

export default PhotographerPage

const columns: BillboardColumn[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "createdAt",
    header: "Date",
  },
]
