import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';
import type { Event } from '../../constants/eventConstants';
import { READABLE_DATE_AND_TIME_FORMAT_PATTERN } from '../../constants/globalConstants';
import { Box, Grid } from '@mui/system';
import { Stack } from '@mui/material';

export interface EventCardProps {
  event: Event
}

function EventCard({...props}: EventCardProps) {
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardActionArea>
        <CardHeader
          title={props.event.title}
          subheader={props.event.startDateTime.format(READABLE_DATE_AND_TIME_FORMAT_PATTERN)}
        />
        <CardContent>
          <Grid container>
            <Grid sx={{
              xs: 12
            }}>
              <Stack>
                <Box component="div">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    <Box sx={{ fontWeight: "bold" }} component="span">Start Time: </Box>{props.event.startDateTime.format(READABLE_DATE_AND_TIME_FORMAT_PATTERN)}
                  </Typography>
                </Box>
                <Box component="div">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    <Box sx={{ fontWeight: "bold" }} component="span">End Time: </Box>{props.event.endDateTime.format(READABLE_DATE_AND_TIME_FORMAT_PATTERN)}
                  </Typography>
                </Box>
                <Box component="div">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    <Box sx={{ fontWeight: "bold" }} component="span">Number of Current Attendees: </Box>{props.event.members.length}
                  </Typography>
                </Box>
                <Box component="div">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    <Box sx={{ fontWeight: "bold" }} component="span">Max Number of Attendees: </Box>{props.event.maxAttendees}
                  </Typography>
                </Box>
                <Box component="div">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    <Box sx={{ fontWeight: "bold" }} component="span">Location: </Box>{props.event.location.locationName}
                  </Typography>
                </Box>
                <Box component="div">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    <Box sx={{ fontWeight: "bold" }} component="span">Description: </Box>{props.event.description}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default EventCard;
