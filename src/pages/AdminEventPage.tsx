import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/SupabaseClient";
import { uploadImage, getImageUrl, deleteImage } from "@/lib/storage";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Loader2, Trash2, Edit } from "lucide-react";

const eventFormSchema = z.object({
  name: z.string().min(3, "Event name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  image: z.instanceof(File).optional(),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface Event {
  event_id: number;
  name: string;
  description: string;
  start_time: string;
  end_time: string;
  image_url: string;
  image_path: string | null;
}

const AdminEventPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      name: "",
      description: "",
      start_time: "",
      end_time: "",
    },
  });

  // Check if user is admin (you'll need to implement this based on your user roles)
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    // TODO: Add admin role check here
  }, [user, navigate]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("events").select("*");
      if (error) throw error;
      setEvents((data as Event[]) || []);
    } catch (error: any) {
      toast.error("Failed to fetch events", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("image", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: EventFormValues) => {
    try {
      setUploadingImage(true);
      let imagePath = editingEvent?.image_path || null;
      let imageUrl = editingEvent?.image_url || "";

      // Handle image upload if a new image is provided
      if (values.image) {
        // Delete old image if editing and there's an existing image
        if (editingEvent?.image_path) {
          await deleteImage(editingEvent.image_path);
        }

        // Upload new image
        const { path, error: uploadError } = await uploadImage({
          file: values.image,
          folder: "events",
        });

        if (uploadError) {
          toast.error("Failed to upload image", {
            description: uploadError.message,
          });
          return;
        }

        if (path) {
          imagePath = path;
          imageUrl = (await getImageUrl(path)) || "";
        }
      }

      // Prepare event data
      const eventData = {
        name: values.name,
        description: values.description,
        start_time: values.start_time,
        end_time: values.end_time,
        image_url: imageUrl,
        image_path: imagePath,
      };

      if (editingEvent) {
        // Update existing event
        const { error } = await supabase
          .from("events")
          .update(eventData)
          .eq("event_id", editingEvent.event_id);

        if (error) throw error;
        toast.success("Event updated successfully!");
      } else {
        // Create new event
        const { error } = await supabase.from("events").insert(eventData);

        if (error) throw error;
        toast.success("Event created successfully!");
      }

      // Reset form and refresh events
      form.reset();
      setEditingEvent(null);
      setImagePreview(null);
      fetchEvents();
    } catch (error: any) {
      toast.error("Failed to save event", {
        description: error.message,
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    form.reset({
      name: event.name,
      description: event.description,
      start_time: event.start_time,
      end_time: event.end_time,
    });
    setImagePreview(event.image_url);
  };

  const handleDelete = async (event: Event) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      // Delete image from storage if exists
      if (event.image_path) {
        await deleteImage(event.image_path);
      }

      // Delete event from database
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("event_id", event.event_id);

      if (error) throw error;

      toast.success("Event deleted successfully!");
      fetchEvents();
    } catch (error: any) {
      toast.error("Failed to delete event", {
        description: error.message,
      });
    }
  };

  const handleCancel = () => {
    form.reset();
    setEditingEvent(null);
    setImagePreview(null);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Event Management</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              {editingEvent ? "Edit Event" : "Create New Event"}
            </CardTitle>
            <CardDescription>
              {editingEvent
                ? "Update the event details below"
                : "Fill in the details to create a new event"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter event name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter event description"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="start_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="end_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="image"
                  render={() => (
                    <FormItem>
                      <FormLabel>Event Image</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <Input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={handleImageChange}
                          />
                          {imagePreview && (
                            <div className="relative">
                              <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-full h-48 object-cover rounded-lg"
                              />
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Accepted formats: JPEG, PNG, WebP (max 5MB)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={uploadingImage}
                    className="flex-1"
                  >
                    {uploadingImage ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : editingEvent ? (
                      "Update Event"
                    ) : (
                      "Create Event"
                    )}
                  </Button>
                  {editingEvent && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing Events</CardTitle>
            <CardDescription>
              Manage your events from the list below
            </CardDescription>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <Alert>
                <AlertDescription>
                  No events found. Create your first event!
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event) => (
                      <TableRow key={event.event_id}>
                        <TableCell className="font-medium">
                          {event.name}
                        </TableCell>
                        <TableCell>
                          {new Date(event.start_time).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(event)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(event)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminEventPage;
