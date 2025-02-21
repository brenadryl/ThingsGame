import { Box } from '@mui/material';
import { LOADING_GIF } from '../themes/constants';


const LoadingLogo = () => (
    <Box alignContent="center" justifyContent="space-between" width="100%" height="100%" alignItems="center">
        <Box margin="auto" maxWidth="300px" paddingY="50px">
            <img src={LOADING_GIF}  alt="JOAKS ON YOU" style={{ maxWidth: '300px', height: 'auto' }} /> 
        </Box>
    </Box>
)




export default LoadingLogo;




