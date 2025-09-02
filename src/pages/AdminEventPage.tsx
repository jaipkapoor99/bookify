import { useState, useEffect } from "react";
import { supabase } from "@/SupabaseClient";
import { Event } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageLoader } from "@/components/ui/PageLoader";
import { toast } from "sonner";

const AdminEventPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Partial<Event> | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("start_time", { ascending: true });
      if (error) throw error;
      setEvents(data || []);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error("Failed to fetch events", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event: Event) => {
    setCurrentEvent(event);
    setIsEditing(true);
  };

  const handleCreate = () => {
    setCurrentEvent({});
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!currentEvent) return;

    try {
      const { data, error } = await supabase
        .from("events")
        .upsert(currentEvent)
        .select();

      if (error) throw error;

      if (data) {
        fetchEvents();
        setIsEditing(false);
        setCurrentEvent(null);
        toast.success("Event saved successfully");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error("Failed to save event", { description: error.message });
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  if (isEditing && currentEvent) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">
          {currentEvent.event_id ? "Edit Event" : "Create Event"}
        </h1>
        <div className="space-y-4">
          <Input
            placeholder="Event Name"
            value={currentEvent.name || ""}
            onChange={(e) =>
              setCurrentEvent({ ...currentEvent, name: e.target.value })
            }
          />
          <Textarea
            placeholder="Description"
            value={currentEvent.description || ""}
            onChange={(e) =>
              setCurrentEvent({ ...currentEvent, description: e.target.value })
            }
          />
          <Input
            type="datetime-local"
            value={currentEvent.start_time || ""}
            onChange={(e) =>
              setCurrentEvent({ ...currentEvent, start_time: e.target.value })
            }
          />
          <Input
            type="datetime-local"
            value={currentEvent.end_time || ""}
            onChange={(e) =>
              setCurrentEvent({ ...currentEvent, end_time: e.target.value })
            }
          />
          <Input
            placeholder="Image URL"
            value={currentEvent.image_url || ""}
            onChange={(e) =>
              setCurrentEvent({ ...currentEvent, image_url: e.target.value })
            }
          />
          <div className="flex gap-2">
            <Button onClick={handleSave}>Save</Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Events</h1>
        <Button onClick={handleCreate}>Create Event</Button>
      </div>
      <div className="space-y-4">
        {events.map((event) => (
          <div
            key={event.event_id}
            className="p-4 border rounded-lg flex justify-between items-center"
          >
            <span>{event.name}</span>
            <Button variant="outline" onClick={() => handleEdit(event)}>
              Edit
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminEventPage;
