-- Create party_requests table
create table if not exists party_requests (
  id uuid primary key default gen_random_uuid(),
  preferred_date timestamp with time zone not null,
  number_of_children integer not null,
  package text not null,
  parent_name text not null,
  phone text not null,
  email text not null,
  child_name_age text,
  special_requests text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  admin_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create an index on status for faster filtering
create index if not exists idx_party_requests_status on party_requests(status);

-- Create an index on created_at for sorting
create index if not exists idx_party_requests_created_at on party_requests(created_at desc);

-- Enable Row Level Security
alter table party_requests enable row level security;

-- Create policy to allow public inserts (for form submissions)
create policy "Allow public inserts" on party_requests
  for insert
  with check (true);

-- Create policy to allow authenticated users to view all party requests
create policy "Allow authenticated users to view all" on party_requests
  for select
  using (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to update party requests
create policy "Allow authenticated users to update" on party_requests
  for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Create a function to automatically update the updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create trigger to automatically update updated_at
create trigger update_party_requests_updated_at
  before update on party_requests
  for each row
  execute function update_updated_at_column();
