import { createClient } from '@supabase/supabase-js';

// Substitua estas duas strings pelas chaves do seu projeto Supabase
const supabaseUrl = 'https://dellxcvyhooipdjdqtjl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlbGx4Y3Z5aG9vaXBkamRxdGpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI1MzY1OTgsImV4cCI6MjEwODExMjU5OH0.Z4vCb6o0UxRzFLTuCRCpJYrjdTFuyvGGhXsdh9E_tQk';

export const supabase = createClient(supabaseUrl, supabaseKey);