import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className='toaster group'
      toastOptions={{
        classNames: {
          // Base styles for all toasts
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'text-inherit', // Inherit text color from toast
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
          
          // Type-specific styles
          error: 'group-[.toaster]:bg-red-500 group-[.toaster]:text-white',
          success: 'group-[.toaster]:bg-green-500 group-[.toaster]:text-white',
          warning: 'group-[.toaster]:bg-yellow-500 group-[.toaster]:text-black',
          info: 'group-[.toaster]:bg-blue-500 group-[.toaster]:text-white',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }