import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Calendar, Pencil, Loader2, Mail, UserRound, AlertCircle } from "lucide-react";
import { useCurrentUser, useUpdateProfile } from "@/hooks/queries";
import { useAuth } from "@/context/auth-context";
import LoginNavBar from "@/components/LoginNavbar";
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
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/formatDate";
import "@/styles/profile.css";

const editSchema = z.object({
  username: z.string().min(6, "Username must be at least 6 characters"),
  email: z.string().email("Please enter a valid email address"),
});
type EditFormValues = z.infer<typeof editSchema>;

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const { data: profile, isLoading, isError, refetch } = useCurrentUser();
  const updateProfile = useUpdateProfile();
  const [isEditing, setIsEditing] = useState(false);
  const form = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    values: { username: profile?.username ?? "", email: profile?.email ?? "" },
  });
  const onSubmit = (data: EditFormValues) => {
    const changes: { username?: string; email?: string } = {};
    if (data.username !== profile?.username) changes.username = data.username;
    if (data.email !== profile?.email) changes.email = data.email;
    if (!Object.keys(changes).length) {
      setIsEditing(false);
      return;
    }
    updateProfile.mutate(changes, {
      onSuccess: () => {
        setIsEditing(false);
        refreshUser();
      },
    });
  };
  const cancel = () => {
    form.reset();
    updateProfile.reset();
    setIsEditing(false);
  };

  return (
    <div className="nebula-profile min-h-screen">
      <LoginNavBar />
      <main className="profile-main">
        <Link
          className="profile-back"
          to={`/dashboard/${user?.userId || localStorage.getItem("user_id") || ""}`}
        >
          <ArrowLeft size={14} />
          Back to projects
        </Link>
        <header className="profile-heading">
          <h1>Your account</h1>
          <p>The details behind your workspace.</p>
        </header>
        {isLoading ? (
          <div className="profile-layout" role="status" aria-label="Loading account">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-80 rounded-xl" />
          </div>
        ) : isError || !profile ? (
          <div className="profile-error" role="alert">
            <AlertCircle size={22} />
            <h2>We couldn’t load your account.</h2>
            <p>Please try again.</p>
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <div className="profile-layout">
            <aside className="profile-summary">
              <div className="profile-avatar" aria-hidden="true">
                {profile.username.slice(0, 2).toUpperCase()}
              </div>
              <h2 title={profile.username}>{profile.username}</h2>
              <p>Nebula workspace member</p>
              <div className="profile-member">
                <Calendar size={15} />
                <span>
                  Member since
                  <time dateTime={profile.createdAt}>
                    {formatDateTime(profile.createdAt) || "Date unavailable"}
                  </time>
                </span>
              </div>
            </aside>
            <section className="profile-details" aria-labelledby="profile-details-heading">
              <div className="profile-details-heading">
                <div>
                  <h2 id="profile-details-heading">Account information</h2>
                  <p>Keep your contact details up to date.</p>
                </div>
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      updateProfile.reset();
                      setIsEditing(true);
                    }}
                  >
                    <Pencil size={14} />
                    Edit profile
                  </Button>
                )}
              </div>
              {isEditing ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="profile-form" noValidate>
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              autoComplete="username"
                              disabled={updateProfile.isPending}
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
                              autoComplete="email"
                              disabled={updateProfile.isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {updateProfile.isError && (
                      <p role="alert" className="text-sm text-destructive">
                        {updateProfile.error.message}
                      </p>
                    )}
                    <div className="profile-form-actions">
                      <Button type="submit" disabled={updateProfile.isPending}>
                        {updateProfile.isPending ? (
                          <>
                            <Loader2
                              size={15}
                              className="animate-spin motion-reduce:animate-none"
                            />
                            Saving…
                          </>
                        ) : (
                          "Save changes"
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={cancel}
                        disabled={updateProfile.isPending}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              ) : (
                <dl className="profile-fields">
                  <div>
                    <dt>
                      <UserRound size={16} />
                      Username
                    </dt>
                    <dd>{profile.username}</dd>
                  </div>
                  <div>
                    <dt>
                      <Mail size={16} />
                      Email address
                    </dt>
                    <dd>{profile.email}</dd>
                  </div>
                </dl>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
};
export default Profile;
