import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import { Box, Grid } from '@mui/system';
import { Stack } from '@mui/material';
import CardActionArea from '@mui/material/CardActionArea';
import type { Event } from '../../constants/eventConstants';
import { READABLE_DATE_AND_TIME_FORMAT_PATTERN } from '../../constants/globalConstants';

export interface EventCardProps {
  event: Event,
  onClickCallback?: (eventUuid: string) => void | null
}

function EventCard(props: EventCardProps) {
  const {
    event,
    onClickCallback = null
  } = props;

  const getCardContent = () => {
    return (
      <CardContent>
          <Grid container>
            <Grid sx={{
              xs: 12
            }}>
              <Stack>
                <Box component="div">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    <Box sx={{ fontWeight: "bold" }} component="span">Start Time: </Box>{event.startDateTime.format(READABLE_DATE_AND_TIME_FORMAT_PATTERN)}
                  </Typography>
                </Box>
                <Box component="div">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    <Box sx={{ fontWeight: "bold" }} component="span">End Time: </Box>{event.endDateTime.format(READABLE_DATE_AND_TIME_FORMAT_PATTERN)}
                  </Typography>
                </Box>
                <Box component="div">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    <Box sx={{ fontWeight: "bold" }} component="span">Number of Current Attendees: </Box>{event.members.length}
                  </Typography>
                </Box>
                <Box component="div">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    <Box sx={{ fontWeight: "bold" }} component="span">Max Number of Attendees: </Box>{event.maxAttendees}
                  </Typography>
                </Box>
                <Box component="div">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    <Box sx={{ fontWeight: "bold" }} component="span">Location: </Box>{event.location.locationName}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
    );
  };

  return (
    <Card sx={{ maxWidth: 345 }}>
      {onClickCallback !== null && (
        <CardActionArea onClick={() => onClickCallback(event.eventUuid)}>
          <CardHeader
            title={event.title}
            subheader={event.startDateTime.format(READABLE_DATE_AND_TIME_FORMAT_PATTERN)}
          />
          {getCardContent()}
        </CardActionArea>
      )}
      {onClickCallback === null && (
        <>
          <CardHeader
            title={event.title}
            subheader={event.startDateTime.format(READABLE_DATE_AND_TIME_FORMAT_PATTERN)}
          />
          {getCardContent()}
        </>
      )}
    </Card>
  );
}

export default EventCard;
