import { motion } from 'framer-motion';
import { Box } from '@mui/material';
import { ReadyToShare } from './ShareCards';

interface SocialPostsTabProps {
  businessName: string;
  locationLabel: string;
  scanUrl: string;
  prizeLabel: string | null;
  canDownload: boolean;
  onRequireLocation: () => void;
  onToast: (msg: string) => void;
}

const SocialPostsTab = ({
  businessName,
  locationLabel,
  scanUrl,
  prizeLabel,
  canDownload,
  onRequireLocation,
  onToast,
}: SocialPostsTabProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.05 }}
    >
      <Box sx={{ pb: 4 }}>
        <ReadyToShare
          businessName={businessName}
          locationLabel={locationLabel}
          scanUrl={scanUrl}
          prizeLabel={prizeLabel}
          canDownload={canDownload}
          onRequireLocation={onRequireLocation}
          onToast={onToast}
        />
      </Box>
    </motion.div>
  );
};

export default SocialPostsTab;
