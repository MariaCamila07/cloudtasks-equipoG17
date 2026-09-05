// Configuración de Supabase
const SUPABASE_URL = "https://sesgddhspjwzuwdhkgxi.supabase.co/rest/v1/";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlc2dkZGhzcGp3enV3ZGhrZ3hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1NDU4MDgsImV4cCI6MjEwNDEyMTgwOH0.8CBTJRJhTUenb6_JLuQdG9AYmZHcem24NjEQFs45UsU";

// Inicializar cliente de Supabase
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);