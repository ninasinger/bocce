-- Set all existing match start times to 6:30 PM in America/New_York.
update matches
set scheduled_datetime = ((scheduled_datetime::date + time '18:30') at time zone 'America/New_York')
where scheduled_datetime is not null;
