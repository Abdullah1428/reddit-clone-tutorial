import React from 'react'
import { Box } from '@chakra-ui/react'

interface WrapperProps {
  variant?: 'small' | 'regular'
}

const Wrapper: React.FC<WrapperProps> = ({ children, variant = 'small' }) => {
  return (
    <Box
      mt={8}
      mx='auto'
      maxW={variant === 'regular' ? '800px' : '400px'}
      w='100%'
    >
      {children}
    </Box>
  )
}

export default Wrapper
