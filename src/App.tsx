import { useEffect } from "react";
import "./App.css";
import { supabase } from "./SupabaseClient";

function App() {
  const getData = async () => {
    const { data, error } = await supabase.from("events").select("*");
    if (error) {
      console.error(error);
    }
    console.log(data);
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <>
      <h1>Hello World</h1>
    </>
  );
}

export default App;
