import { Box, BoxProps } from 'rebass'

export function MobileBottomShadowContainer({ children, ...flexProps }: BoxProps) {
  return (
    <Box flex={1} sx={{ position: 'fixed', width: '100vw', bottom: 0 }}>
      <Box
        sx={{
          background: 'rgba(1, 1, 1, 0.5)',
          width: '100vw',
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          padding: '1.5rem',
          paddingBottom: '2.5rem',
          minHeight: 'fit-content',
          '> div': {
            lineHeight: '1.8rem'
          },
          display: 'flex',
          height: 'max-content',
          borderTopLeftRadius: '1.5rem',
          borderTopRightRadius: '1.5rem',
          boxShadow: '0px -5px 54px rgba(57, 225, 186, 0.25)',
          backdropFilter: 'blur(5px)',
          'button,a': {
            maxHeight: '3.5rem',
            fontWeight: 400
          },
          ...(flexProps.sx ?? {})
        }}
        {...(() => {
          delete flexProps['sx']
          return flexProps
        })()}
      >
        {children}
      </Box>
    </Box>
  )
}
