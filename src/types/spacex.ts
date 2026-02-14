export interface SpaceXLaunch {
  flight_number: number;
  mission_name: string;
  launch_year: string;
  launch_date_utc: string;
  rocket: {
    rocket_name: string;
    rocket_type: string;
  };
  links: {
    mission_patch: string | null;
    mission_patch_small: string | null;
    article_link: string | null;
    wikipedia: string | null;
    video_link: string | null;
  };
  details: string | null;
  launch_success: boolean | null;
}