import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { useState } from 'react'

interface TableDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (rows: number, cols: number) => void
}

export function TableDialog({ open, onOpenChange, onSubmit }: TableDialogProps) {
  const [rows, setRows] = useState('3')
  const [cols, setCols] = useState('3')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(parseInt(rows), parseInt(cols))
    setRows('3')
    setCols('3')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Insert Table</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="rows">Rows</label>
                <Input
                  id="rows"
                  type="number"
                  min="1"
                  value={rows}
                  onChange={(e) => setRows(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="cols">Columns</label>
                <Input
                  id="cols"
                  type="number"
                  min="1"
                  value={cols}
                  onChange={(e) => setCols(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Insert</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
