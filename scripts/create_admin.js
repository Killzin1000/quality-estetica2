
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mnnfssqelidcqhrhdypg.supabase.co';
const supabaseKey = 'sb_publishable_5t9FR8nWQ1Yb5Ck2VwBLLA_uXxopwaf';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin() {
    console.log('Creating Admin User...');

    const { data, error } = await supabase.auth.signUp({
        email: 'admin@quality.com',
        password: 'Quality@2026',
        options: {
            data: {
                full_name: 'Jorge Admin'
            }
        }
    });

    if (error) {
        console.error('Error creating user:', error.message);
    } else {
        console.log('User created successfully:', data.user?.id);
        console.log('Please check your email for verification if enabled, or check the database.');
    }
}

createAdmin();
