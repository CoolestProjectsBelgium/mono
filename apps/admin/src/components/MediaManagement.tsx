import React, { useState, useEffect } from 'react'
import { ApiClient } from 'adminjs'
import { Box, H4, Text } from '@adminjs/design-system'
import { styled } from '@adminjs/design-system/styled-components'

const api = new ApiClient()

// Interface voor de individuele media-items uit de backend workspace
interface MediaItem {
    id: number
    projectId?: number
    mimetype: string
    name: string
    base64: string
    confirmed: boolean
}

// Styled component voor de container-kaarten
const Card = styled(Box)`
  color: ${({ theme }) => theme.colors.grey100};
  height: 100%;
  border: 1px solid transparent;
  border-radius: ${({ theme }) => theme.space.md};
  background: white;
`
//Card.defaultProps = { variant: 'container', boxShadow: 'card' }

export const MediaManagement: React.FC = () => {
    const [media, setMedia] = useState<MediaItem[]>([])
    const [loading, setLoading] = useState<boolean>(true)

    // Functie om de mediabestanden dynamisch op te halen van de custom AdminJS pagina
    const loadMedia = () => {
        setLoading(true)
        api.getPage({ pageName: 'Mediabewerkingen' })
            .then((response) => {
                const data = response.data as { media?: MediaItem[] }
                setMedia(data.media || [])
                setLoading(false)
            })
            .catch((error) => {
                console.error('Fout bij het ophalen van de media:', error)
                setLoading(false)
            })
    }

    // Laad de data direct in zodra de pagina geopend wordt
    useEffect(() => {
        loadMedia()
    }, [])

    return (
        <Box p="xl">
            <Card>
                <Box p="xl">
                    <H4 marginBottom="lg">Project Media & Selectie (Max. 1 per project confirmed)</H4>
                    
                    {loading ? (
                        <Text color="grey60">Bestanden worden ingeladen uit de container workspace...</Text>
                    ) : media.length > 0 ? (
                        <Box flex flexDirection="row" flexWrap="wrap" gap="20px">
                            {media.map((file) => {
                                const isVideo = file.mimetype.startsWith('video/')
                                
                                // Functie die wordt getriggerd wanneer je een radio-button indrukt
                                const handleConfirmToggle = async () => {
                                    try {
                                        // Stuur een POST-request naar de handler in index.ts
                                        await api.getPage({
                                            pageName: 'Mediabewerkingen',
                                            method: 'post',
                                            data: {
                                                action: 'toggle-confirm',
                                                attachmentId: file.id
                                            }
                                        })
                                        // Herlaad de media direct om de groene randen en status te updaten
                                        loadMedia()
                                    } catch (error) {
                                        console.error('Fout bij het updaten van de confirmed status:', error)
                                    }
                                }

                                return (
                                    <Box 
                                        key={file.id} 
                                        width={['1', '1/2', '1/3', '240px']} 
                                        style={{ 
                                            border: file.confirmed ? '2px solid #10b981' : '1px solid #e2e8f0', 
                                            borderRadius: '8px', 
                                            padding: '12px', 
                                            textAlign: 'center',
                                            backgroundColor: file.confirmed ? '#f0fdf4' : 'transparent',
                                            transition: 'all 0.2s ease-in-out'
                                        }}
                                    >
                                        {/* Klikbare thumbnail die de Base64 data opent in een nieuw tabblad */}
                                        <a href={file.base64} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
                                            {isVideo ? (
                                                <video 
                                                    src={file.base64} 
                                                    style={{ width: '100%', height: '130px', objectFit: 'cover', borderRadius: '6px' }} 
                                                    muted 
                                                />
                                            ) : (
                                                <img 
                                                    src={file.base64} 
                                                    alt={file.name} 
                                                    style={{ width: '100%', height: '130px', objectFit: 'cover', borderRadius: '6px' }} 
                                                />
                                            )}
                                        </a>

                                        {/* Radio-button selectie per projectgroep */}
                                        <Box marginTop="md" flex flexDirection="row" alignItems="center" justifyContent="center" gap="8px">
                                            <input 
                                                type="radio" 
                                                id={`confirm-${file.id}`}
                                                // Groepeer op projectId zodat je per project één selectie kunt maken
                                                name={`project-selection-${file.projectId || 'global'}`} 
                                                checked={file.confirmed}
                                                onChange={handleConfirmToggle}
                                                style={{ transform: 'scale(1.3)', cursor: 'pointer' }}
                                            />
                                            <label 
                                                htmlFor={`confirm-${file.id}`} 
                                                style={{ 
                                                    fontSize: '14px', 
                                                    fontWeight: file.confirmed ? 'bold' : 'normal', 
                                                    color: file.confirmed ? '#059669' : '#4b5563',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {file.confirmed ? '✓ Confirmed' : 'Selecteer'}
                                            </label>
                                        </Box>
                                    </Box>
                                )
                            })}
                        </Box>
                    ) : (
                        <Text color="grey80">Er zijn momenteel geen media bestanden in de workspace map gevonden voor dit event.</Text>
                    )}
                </Box>
            </Card>
        </Box>
    )
}

export default MediaManagement
