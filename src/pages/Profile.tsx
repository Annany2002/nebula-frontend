import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, X, Calendar, Mail, User } from "lucide-react";
import { useCurrentUser, useUpdateProfile } from "@/hooks/queries";
import LoginNavBar from "@/components/LoginNavbar";
import BreadCrumbNav from "@/components/BreadCrumbNav";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatDateTime } from "@/lib/formatDate";

const editSchema = z.object({
  username: z.string().min(6, "Username must be at least 6 characters"),
  email: z.string().email("Please enter a valid email address"),
});

type EditFormValues = z.infer<typeof editSchema>;

const Profile = () => {
  const { data: profile, isLoading, isError } = useCurrentUser();
  const updateProfile = useUpdateProfile();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    values: {
      username: profile?.username ?? "",
      email: profile?.email ?? "",
    },
  });

  const onSubmit = async (data: EditFormValues) => {
    const changes: { username?: string; email?: string } = {};
    if (data.username !== profile?.username) changes.username = data.username;
    if (data.email !== profile?.email) changes.email = data.email;

    if (Object.keys(changes).length === 0) {
      setIsEditing(false);
      return;
    }

    updateProfile.mutate(changes, {
      onSuccess: () => setIsEditing(false),
    });
  };

  const initials = profile?.username
    ? profile.username.substring(0, 2).toUpperCase()
    : "??";

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <LoginNavBar />
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="min-h-screen">
        <LoginNavBar />
        <div className="flex h-[60vh] items-center justify-center">
          <p className="text-muted-foreground">
            Failed to load profile. Please try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <LoginNavBar />

      <div className="px-4 md:px-6 lg:px-8 py-6 space-y-8">
        <BreadCrumbNav />

        {/* Header */}
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-bold tracking-tight"
          >
            Your Profile
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground mt-1"
          >
            View and manage your account information.
          </motion.p>
        </div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl"
        >
          <Card className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-white/20 dark:border-gray-700/50">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border bg-primary/10 text-primary text-xl font-bold">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-xl truncate">
                  {profile.username}
                </CardTitle>
                <CardDescription className="truncate">
                  {profile.email}
                </CardDescription>
              </div>
              <Button
                variant={isEditing ? "ghost" : "outline"}
                size="icon"
                className="h-9 w-9 shrink-0"
                onClick={() => {
                  if (isEditing) {
                    form.reset();
                  }
                  setIsEditing(!isEditing);
                }}
              >
                {isEditing ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Pencil className="h-4 w-4" />
                )}
              </Button>
            </CardHeader>

            <Separator />

            <CardContent className="pt-6">
              {isEditing ? (
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="bg-transparent"
                              placeholder="Enter username"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              className="bg-transparent"
                              placeholder="you@example.com"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-3 pt-2">
                      <Button
                        type="submit"
                        disabled={updateProfile.isPending}
                        className="rounded-2xl"
                      >
                        {updateProfile.isPending
                          ? "Saving..."
                          : "Save Changes"}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="rounded-2xl"
                        onClick={() => {
                          form.reset();
                          setIsEditing(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Username</p>
                      <p className="font-medium">{profile.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{profile.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Member since
                      </p>
                      <p className="font-medium">
                        {formatDateTime(profile.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
