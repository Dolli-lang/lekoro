-- Create auth_history table to track logins and signups
CREATE TABLE public.auth_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_email TEXT,
  event_type TEXT NOT NULL, -- 'login' or 'signup'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT
);

-- Enable RLS
ALTER TABLE public.auth_history ENABLE ROW LEVEL SECURITY;

-- Only admins can view auth history
CREATE POLICY "Admins can view all auth history" 
ON public.auth_history 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow inserting auth history (for triggers)
CREATE POLICY "Allow insert auth history" 
ON public.auth_history 
FOR INSERT 
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_auth_history_created_at ON public.auth_history(created_at DESC);
CREATE INDEX idx_auth_history_user_id ON public.auth_history(user_id);

-- Create function to log auth events
CREATE OR REPLACE FUNCTION public.log_auth_event()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.auth_history (user_id, user_email, event_type)
    VALUES (NEW.id, NEW.email, 'signup');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user signups
CREATE TRIGGER on_auth_user_signup_log
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.log_auth_event();