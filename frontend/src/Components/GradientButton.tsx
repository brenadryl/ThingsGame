import { Button } from '@mui/material';

interface GradientButtonProps {
    startIcon?: JSX.Element,
    endIcon?: JSX.Element,
    firstColor: string;
    secondColor: string;
    textColor?: string;
    onClick: () => void;
    children?: JSX.Element,
  }

const GradientButton = ({ startIcon, endIcon, children, firstColor, secondColor, onClick, textColor }: GradientButtonProps) => {

    return (
        <Button 
            endIcon={endIcon}
            startIcon={startIcon}
            variant="contained"
            onClick={onClick}
            sx={{
            background: `linear-gradient(180deg, ${firstColor} 10%, ${secondColor} 90%)`,
            border: 0,
            color: {textColor},
        }}>
            {children}
        </Button>

    )
}




export default GradientButton;