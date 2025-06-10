import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wzwkkxypqxtjnxsesefk.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6d2treHlwcXh0am54c2VzZWZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4NTA0MzgsImV4cCI6MjA1OTQyNjQzOH0.LyBJid5CSta13XHOBRwxzp85hlISwUD-VsvUynRfc3I";

const supabase = createClient(supabaseUrl, supabaseKey);

async function createUserProfile() {
  console.log("🔍 Creating user profile manually...");

  // Insert the user from the logs
  const userId = "d4cff42c-cd6c-4854-b145-89e3bf57079d";
  const userName = "Jai Kapoor";

  try {
    const { data, error } = await supabase
      .from("users")
      .insert({
        supabase_id: userId,
        name: userName,
      })
      .select();

    if (error) {
      console.error("❌ Error creating user:", error);
    } else {
      console.log("✅ User created successfully:", data);
    }

    // Now check users table
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("*");

    if (usersError) {
      console.error("❌ Error fetching users:", usersError);
    } else {
      console.log("📋 All users:", users);
    }
  } catch (error) {
    console.error("💥 Unexpected error:", error);
  }
}

async function checkTicketsTable() {
  console.log("\n🔍 Checking tickets table structure...");

  try {
    // Try to insert a test record to see what columns exist
    const testInsert = {
      customer_id: 1,
      ticket_price: 1000,
      quantity: 1,
    };

    // First try with events_venues_id
    console.log("Testing with events_venues_id...");
    const { data, error } = await supabase
      .from("tickets")
      .insert({
        ...testInsert,
        events_venues_id: 1,
      })
      .select();

    if (error) {
      console.error("❌ Error with events_venues_id:", error);

      // Try with event_venue_id instead
      console.log("Testing with event_venue_id...");
      const { data: data2, error: error2 } = await supabase
        .from("tickets")
        .insert({
          ...testInsert,
          event_venue_id: 1,
        })
        .select();

      if (error2) {
        console.error("❌ Error with event_venue_id:", error2);
      } else {
        console.log("✅ Success with event_venue_id:", data2);
      }
    } else {
      console.log("✅ Success with events_venues_id:", data);
    }
  } catch (error) {
    console.error("💥 Unexpected error:", error);
  }
}

createUserProfile().then(() => checkTicketsTable());
