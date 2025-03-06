import {
  CheckSquare,
  Code,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  List,
  ListOrdered,
  Table,
  Text,
  TextQuote,
  Youtube
} from 'lucide-react'
import { createSuggestionItems } from 'novel/extensions'
import { Command, renderItems } from 'novel/extensions'
import { uploadFn } from './image-upload'
import { YoutubeDialog } from './dialogs/youtube-dialog'
import { TableDialog } from './dialogs/table-dialog'
import { useState } from 'react'

interface DialogState {
  youtubeDialog: boolean;
  tableDialog: boolean;
  currentEditor: any;
  currentRange: any;
}

// Global state for dialogs since they're rendered at the root
let dialogState: DialogState = {
  youtubeDialog: false,
  tableDialog: false,
  currentEditor: null,
  currentRange: null
}

let setYoutubeOpen: ((open: boolean) => void) | null = null
let setTableOpen: ((open: boolean) => void) | null = null

export function DialogProvider() {
  const [youtubeDialogOpen, setYoutubeDialogOpen] = useState(false)
  const [tableDialogOpen, setTableDialogOpen] = useState(false)

  // Store setters for global access
  setYoutubeOpen = setYoutubeDialogOpen
  setTableOpen = setTableDialogOpen

  const handleYoutubeSubmit = (videoLink: string) => {
    setYoutubeDialogOpen(false)
    
    const ytregex = new RegExp(
      /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/
    )

    if (ytregex.test(videoLink)) {
      dialogState.currentEditor
        ?.chain()
        .focus()
        .deleteRange(dialogState.currentRange)
        .setYoutubeVideo({
          src: videoLink
        })
        .run()
    } else {
      alert('Please enter a correct Youtube Video Link')
    }
  }

  const handleTableSubmit = (rows: number, cols: number) => {
    setTableDialogOpen(false)
    dialogState.currentEditor
      ?.chain()
      .focus()
      .deleteRange(dialogState.currentRange)
      .insertTable({ rows, cols, withHeaderRow: true })
      .run()
  }

  return (
    <>
      <YoutubeDialog
        open={youtubeDialogOpen}
        onOpenChange={setYoutubeDialogOpen}
        onSubmit={handleYoutubeSubmit}
      />
      <TableDialog
        open={tableDialogOpen}
        onOpenChange={setTableDialogOpen}
        onSubmit={handleTableSubmit}
      />
    </>
  )
}

export const suggestionItems = createSuggestionItems([
  {
    title: 'Text',
    description: 'Just start typing with plain text.',
    searchTerms: ['p', 'paragraph'],
    icon: <Text size={18} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleNode('paragraph', 'paragraph')
        .run()
    }
  },
  {
    title: 'To-do List',
    description: 'Track tasks with a to-do list.',
    searchTerms: ['todo', 'task', 'list', 'check', 'checkbox'],
    icon: <CheckSquare size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run()
    }
  },
  {
    title: 'Heading 1',
    description: 'Big section heading.',
    searchTerms: ['title', 'big', 'large'],
    icon: <Heading1 size={18} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode('heading', { level: 1 })
        .run()
    }
  },
  {
    title: 'Heading 2',
    description: 'Medium section heading.',
    searchTerms: ['subtitle', 'medium'],
    icon: <Heading2 size={18} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode('heading', { level: 2 })
        .run()
    }
  },
  {
    title: 'Heading 3',
    description: 'Small section heading.',
    searchTerms: ['subtitle', 'small'],
    icon: <Heading3 size={18} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode('heading', { level: 3 })
        .run()
    }
  },
  {
    title: 'Bullet List',
    description: 'Create a simple bullet list.',
    searchTerms: ['unordered', 'point'],
    icon: <List size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run()
    }
  },
  {
    title: 'Numbered List',
    description: 'Create a list with numbering.',
    searchTerms: ['ordered'],
    icon: <ListOrdered size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run()
    }
  },
  {
    title: 'Quote',
    description: 'Capture a quote.',
    searchTerms: ['blockquote'],
    icon: <TextQuote size={18} />,
    command: ({ editor, range }) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleNode('paragraph', 'paragraph')
        .toggleBlockquote()
        .run()
  },
  {
    title: 'Code',
    description: 'Capture a code snippet.',
    searchTerms: ['codeblock'],
    icon: <Code size={18} />,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run()
  },
  {
    title: 'Image',
    description: 'Upload an image from your computer.',
    searchTerms: ['photo', 'picture', 'media'],
    icon: <ImageIcon size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run()
      // upload image
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = async () => {
        if (input.files?.length) {
          const file = input.files[0]
          const pos = editor.view.state.selection.from
          uploadFn(file, editor.view, pos)
        }
      }
      input.click()
    }
  },
  {
    title: 'Youtube',
    description: 'Embed a Youtube video.',
    searchTerms: ['video', 'youtube', 'embed'],
    icon: <Youtube size={18} />,
    command: ({ editor, range }) => {
      dialogState.currentEditor = editor
      dialogState.currentRange = range
      setYoutubeOpen?.(true)
    }
  },
  {
    title: 'Table',
    description: 'Add a table.',
    searchTerms: ['table', 'grid', 'spreadsheet', 'rows', 'columns'],
    icon: <Table size={18} />,
    command: ({ editor, range }) => {
      dialogState.currentEditor = editor
      dialogState.currentRange = range
      setTableOpen?.(true)
    }
  }
])

export const slashCommand = Command.configure({
  suggestion: {
    items: () => suggestionItems,
    render: renderItems
  }
})
