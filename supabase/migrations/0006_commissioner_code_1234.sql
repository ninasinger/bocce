-- Set commissioner code to 1234 for all existing seasons (temporary).
update seasons
set commissioner_code_hash = '$2a$10$2Y2zqm2VvXu9jJUPSLg5HOU/1AxS32L1s/lhB2O4WlcqytuP6jxs.';
