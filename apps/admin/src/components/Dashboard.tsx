import React, { useState, useEffect } from 'react'
import { ApiClient } from 'adminjs'

import { 
    Box, 
    H4,
    H5,
    Table,
    TableRow,
    TableBody,
    TableCell,
    TableHead,
    Text 
} from '@adminjs/design-system'
import { styled } from '@adminjs/design-system/styled-components'

const api = new ApiClient()

// 1. Unieke interface voor tabelitems (vragen & t-shirts)
interface TableItem {
    id: string | number
    total: number | string
    short: string
    description: string
}

// 2. Hoofdinterface voor alle dashboardgegevens
interface DashboardData {
    event_title?: string
    officialStartDate?: string
    days_remaining?: number
    pending_users?: number
    overdue_registration?: number
    waiting_list?: number
    total_unusedVouchers?: number
    total_projects?: number
    maxRegistration?: number
    total_usedVouchers?: number
    total_users?: number
    total_videos?: number
    tlang_nl?: number
    tlang_fr?: number
    tlang_en?: number
    total_females?: number
    total_males?: number
    total_X?: number
    questions?: TableItem[]
    tshirts?: TableItem[]
}

// Props interface voor de gestylede Card component
interface CardProps {
    flex?: boolean
}

const pageHeaderHeight = 300
const pageHeaderPaddingY = 54
const pageHeaderPaddingX = 300

const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
}

export const DashboardHeader: React.FC = () => {
    const [data, setData] = useState<DashboardData>({})

    useEffect(() => {
        let isSubscribed = true
        api.getDashboard().then((response) => {
            console.log('dashboard.tsx_02', response)
            if (isSubscribed) {
                setData(response.data as DashboardData)
            }
        })
        return () => {
            isSubscribed = false
        }
    }, [])

    return (
        <Box position="relative" overflow="hidden">
            <Box
                bg="grey100"
                height={pageHeaderHeight}
                py={pageHeaderPaddingY}
                px={['default', 'lg', pageHeaderPaddingX]}
            >
                <Box textAlign="center" color="white">
                    <h2 style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0' }}>
                        {data.event_title}
                    </h2>
                    <Text>starting on : {' '}
                        {data.officialStartDate !== undefined
                            ? new Intl.DateTimeFormat('en-BE', options).format(new Date(data.officialStartDate))
                            : 'No event'}
                    </Text>
                    <Text>{data.days_remaining} days remaining</Text>
                </Box>
            </Box>
        </Box>
    )
}

// Type definitie voor de navigatieblokken (indien je deze later wil renderen)
type BoxType = {
    title: string
    subtitle: string
    href: string
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const boxes = (): Array<BoxType> => [
    {
        title: "Register",
        subtitle: "Register on behalf of a participant",
        href: 'https://docs.adminjs.co/basics/resource#providing-resources-explicitly',
    },
    {
        title: "Upload Foto",
        subtitle: "Upload fotos on behalf of a participant",
        href: 'https://docs.adminjs.co/basics/resource#providing-resources-explicitly',
    },
    {
        title: "StatistiekNew",
        subtitle: "Show several statistics about the event New",
        href: 'https://docs.adminjs.co/basics/resource#providing-resources-explicitly',
    },
]

// Volledig getypeerde Styled Component
const Card = styled(Box)<CardProps>`
  display: ${({ flex }): string => (flex ? 'flex' : 'block')};
  color: ${({ theme }) => theme.colors.grey100};
  height: 100%;
  text-decoration: none;
  border: 1px solid transparent;
  border-radius: ${({ theme }) => theme.space.md};
  transition: all 0.1s ease-in;

  &:hover {
    border: 1px solid ${({ theme }) => theme.colors.primary60};
    box-shadow: ${({ theme }) => theme.shadows.cardHover};
  }

  & .dsc-icon svg, .gh-icon svg {
    width: 64px;
    height: 64px;
  }
`

Card.defaultProps = {
    variant: 'container',
    boxShadow: 'card',
}

export const Dashboard: React.FC = () => {
    const [data, setData] = useState<DashboardData>({})

    useEffect(() => {
        let isSubscribed = true
        api.getDashboard().then((response) => {
            if (isSubscribed) {
                setData(response.data as DashboardData)
            }
        })
        return () => {
            isSubscribed = false
        }
    }, [])

    return (
        <Box>
            <DashboardHeader />
            <Box
                mt={['xl', 'xl', '-100px']}
                mb="xl"
                mx={[0, 0, 0, 'auto']}
                px={['default', 'lg', 'xxl', '0']}
                position="relative"
                flex
                flexDirection="row"
                flexWrap="wrap"
                justifyContent="space-between"
                alignContent="flex-start"
                width={[1, 1, 1, 1024]}
            >
                {/* 1. Status Registrations */}
                <Box width={[1, 1, 1 / 2]} p="lg">
                    <Card as="a" flex>
                        <Box ml="xl">
                            <H4>Status Registrations</H4>
                            <ul>
                                <li>{data.pending_users ?? 0} Registrations Pending</li>
                                <li>{data.overdue_registration ?? 0} Overdue registrations</li>
                                <li>{data.waiting_list ?? 0} On waiting list</li>
                                <li>{data.total_unusedVouchers ?? 0} unused vouchers</li>
                            </ul>
                        </Box>
                    </Card>
                </Box>

                {/* 2. Status Projects */}
                <Box width={[1, 1, 1 / 2]} p="lg">
                    <Card as="a" flex>
                        <Box ml="xl">
                            <H4>Status Projects</H4>
                            <ul>
                                <li>
                                    {data.total_projects ?? 0}/{data.maxRegistration ?? 0} Projects Remaining / with{' '}
                                    {data.total_usedVouchers ?? 0} Co-Worker(s)
                                </li>
                                <li>
                                    {((data.total_users || 0) - (data.total_usedVouchers || 0) - (data.total_projects || 0))} user(s) without Project
                                </li>
                                <li>{data.total_videos ?? 0} Project(s) with foto/video confirmed</li>
                            </ul>
                        </Box>
                    </Card>
                </Box>

                {/* 3. Statistics Users */}
                <Box width={[1, 1, 1 / 2]} p="lg">
                    <Card as="a" flex>
                        <Box ml="xl">
                            <H4>Statistics Users (total:{data.total_users ?? 0})</H4>
                            <Box flex flexDirection="row" justifyContent="space-between" position="relative">
                                <Box width={[1, 1, 1 / 2]}>
                                    <H5>Languages</H5>
                                    <ul>
                                        <li>{data.tlang_nl || 0} nl</li>
                                        <li>{data.tlang_fr || 0} fr</li>
                                        <li>{data.tlang_en || 0} en</li>
                                    </ul>
                                </Box>
                                <Box width={[1, 1, 1 / 2]}>
                                    <H5>Sex</H5>
                                    <ul>
                                        <li>{data.total_females || 0} females</li>
                                        <li>{data.total_males || 0} males</li>
                                        <li>{data.total_X || 0} X</li>
                                    </ul>
                                </Box>
                            </Box>
                        </Box>
                    </Card>
                </Box>

                {/* 4. Answers Table */}
                <Box width={[1, 1, 1]} p="lg">
                    <Card as="a" flex>
                        <Box ml="xl" width="100%">
                            <H4>Answers controle list</H4>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>total</TableCell>
                                        <TableCell>short</TableCell>
                                        <TableCell>description</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.questions && data.questions.map((question) => (
                                        <TableRow key={question.id}>
                                            <TableCell>{question.total}</TableCell>
                                            <TableCell>{question.short}</TableCell>
                                            <TableCell>{question.description}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Card>
                </Box>

                {/* 5. T-Shirts Table */}
                <Box width={[1, 1, 1]} p="lg">
                    <Card as="a" flex>
                        <Box ml="xl" width="100%">
                            <H4>T-Shirts order list</H4>
                            <Table>
                                <TableHead>
                                   <TableRow>
                                        <TableCell>total</TableCell>
                                        <TableCell>short</TableCell>
                                        <TableCell>description</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.tshirts &&
                                        data.tshirts.map((tshirt) => (
                                            <TableRow key={tshirt.id}>
                                                <TableCell>{tshirt.total}</TableCell>
                                                <TableCell>{tshirt.short}</TableCell>
                                                <TableCell>{tshirt.description}</TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Card>
                </Box>        
            </Box>
        </Box>
    )
}
export default Dashboard