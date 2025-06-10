// Quick database data dump for debugging
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load environment variables
config({ path: ".env.local" });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function dumpData() {
  console.log("🔍 Database Data Dump");
  console.log("=".repeat(50));

  try {
    // Users table
    console.log("\n📊 USERS:");
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("*")
      .limit(10);

    if (usersError) {
      console.error("❌ Users error:", usersError);
    } else {
      console.log(`Found ${users.length} users:`);
      users.forEach((user) => {
        console.log(
          `  - ID: ${user.user_id}, Supabase ID: ${user.supabase_id}, Name: ${user.name}, Email: ${user.email}`
        );
      });
    }

    // Events table
    console.log("\n🎪 EVENTS:");
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("*")
      .limit(10);

    if (eventsError) {
      console.error("❌ Events error:", eventsError);
    } else {
      console.log(`Found ${events.length} events:`);
      events.forEach((event) => {
        console.log(`  - ID: ${event.event_id}, Name: ${event.name}`);
      });
    }

    // Venues table
    console.log("\n🏢 VENUES:");
    const { data: venues, error: venuesError } = await supabase
      .from("venues")
      .select("*")
      .limit(10);

    if (venuesError) {
      console.error("❌ Venues error:", venuesError);
    } else {
      console.log(`Found ${venues.length} venues:`);
      venues.forEach((venue) => {
        console.log(
          `  - ID: ${venue.venue_id}, Name: ${venue.venue_name}, Location ID: ${venue.location_id}`
        );
      });
    }

    // Events_venues table
    console.log("\n🔗 EVENTS_VENUES:");
    const { data: eventVenues, error: eventVenuesError } = await supabase
      .from("events_venues")
      .select("*")
      .limit(10);

    if (eventVenuesError) {
      console.error("❌ Events_venues error:", eventVenuesError);
    } else {
      console.log(`Found ${eventVenues.length} event-venue combinations:`);
      eventVenues.forEach((ev) => {
        console.log(
          `  - Event Venue ID: ${ev.event_venue_id}, Event ID: ${ev.event_id}, Venue ID: ${ev.venue_id}, Tickets: ${ev.no_of_tickets}, Price: ${ev.price}, Date: ${ev.event_venue_date}`
        );
      });
    }

    // Tickets table
    console.log("\n🎫 TICKETS:");
    const { data: tickets, error: ticketsError } = await supabase
      .from("tickets")
      .select("*")
      .limit(10);

    if (ticketsError) {
      console.error("❌ Tickets error:", ticketsError);
    } else {
      console.log(`Found ${tickets.length} tickets:`);
      tickets.forEach((ticket) => {
        console.log(
          `  - Ticket ID: ${ticket.ticket_id}, Customer ID: ${ticket.customer_id}, Event Venue ID: ${ticket.events_venues_id}, Price: ${ticket.ticket_price}, Quantity: ${ticket.quantity}`
        );
      });
    }

    // Test book_ticket function
    console.log("\n🧪 TESTING book_ticket FUNCTION:");
    console.log(
      "Checking if function exists and what parameters it expects..."
    );

    // Try calling with invalid params to see error
    const { data: rpcTest, error: rpcError } = await supabase.rpc(
      "book_ticket",
      {
        p_event_venue_id: 999999, // Non-existent ID
        p_quantity: 1,
      }
    );

    if (rpcError) {
      console.log("📝 RPC Error (expected):", rpcError.message);
      console.log("📝 RPC Details:", {
        code: rpcError.code,
        details: rpcError.details,
        hint: rpcError.hint,
      });
    } else {
      console.log("✅ RPC call succeeded (unexpected)");
    }
  } catch (error) {
    console.error("💥 General error:", error);
  }
}

dumpData();
