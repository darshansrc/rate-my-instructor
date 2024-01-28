import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  "https://oyqfjratexbolcvdjysi.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95cWZqcmF0ZXhib2xjdmRqeXNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDY0NjIyNTQsImV4cCI6MjAyMjAzODI1NH0.wK3XhuCxT-ZPKiescPz4V76w8ZOarpTJgNFWB4kZImQ"
);

export default supabase;
