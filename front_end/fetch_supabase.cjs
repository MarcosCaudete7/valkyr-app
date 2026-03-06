const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://ihzvlmqdbihimsidhzsd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloenZsbXFkYmloaW1zaWRoenNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNzA4MDcsImV4cCI6MjA4MDg0NjgwN30.QADb5dUrqAI6Yz03CeLTNgLT12d58W1AzLUzyeCK-Co';

const supabase = createClient(supabaseUrl, supabaseKey);

async function getExercises() {
    console.log("Fetching from Supabase...");
    const { data, error } = await supabase.from('exercises').select('*');
    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Found " + data.length + " exercises.");
        fs.writeFileSync('exercises_list.json', JSON.stringify(data, null, 2));
    }
}
getExercises();
