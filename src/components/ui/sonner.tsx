
import { useTheme } from "@/components/theme-provider"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg dark:group-[.toaster]:shadow-md",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "group-[.toast]:bg-green-50 dark:group-[.toast]:bg-green-900/20 group-[.toast]:text-green-600 dark:group-[.toast]:text-green-400 group-[.toast]:border-green-200 dark:group-[.toast]:border-green-900/30",
          error: "group-[.toast]:bg-red-50 dark:group-[.toast]:bg-red-900/20 group-[.toast]:text-red-600 dark:group-[.toast]:text-red-400 group-[.toast]:border-red-200 dark:group-[.toast]:border-red-900/30",
          info: "group-[.toast]:bg-purple-50 dark:group-[.toast]:bg-purple-900/20 group-[.toast]:text-purple-600 dark:group-[.toast]:text-purple-400 group-[.toast]:border-purple-200 dark:group-[.toast]:border-purple-900/30",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
