import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkTicketsSchema() {
  console.log("🔍 Checking tickets table schema...");

  try {
    // Check the tickets table structure
    const { data, error } = await supabase.from("tickets").select("*").limit(1);

    if (error) {
      console.error("❌ Error querying tickets table:", error);
      return;
    }

    console.log("✅ Tickets table query successful");
    console.log("📋 Sample data structure:", data);

    // Also try to get the actual schema information
    const { data: schemaData, error: schemaError } = await supabase.rpc(
      "get_table_schema",
      { table_name: "tickets" }
    );

    if (schemaError) {
      console.log("⚠️  Could not get schema info:", schemaError.message);
    } else {
      console.log("📊 Schema info:", schemaData);
    }
  } catch (error) {
    console.error("💥 Unexpected error:", error);
  }
}

// Also test the book_ticket function directly
async function testBookTicket() {
  console.log("\n🧪 Testing book_ticket function...");

  try {
    const { data, error } = await supabase.rpc("book_ticket", {
      p_event_venue_id: 1,
      p_quantity: 1,
    });

    if (error) {
      console.error("❌ book_ticket error:", error);
    } else {
      console.log("✅ book_ticket success:", data);
    }
  } catch (error) {
    console.error("💥 book_ticket unexpected error:", error);
  }
}

checkTicketsSchema().then(() => testBookTicket());
