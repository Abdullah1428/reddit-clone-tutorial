import React from 'react'
import { Box, Link, Flex, Button } from '@chakra-ui/react'
import NextLink from 'next/link'
import { useMeQuery } from '../generated/graphql'

interface NavBarProps {}

const NavBar: React.FC<NavBarProps> = ({}) => {
  const [{ data, fetching }] = useMeQuery()

  let body = null

  if (fetching) {
  } else if (data && data.me) {
    body = (
      <Flex>
        <Box mr={2}>{data.me.username}</Box>
        <Button variant='link'>logout</Button>
      </Flex>
    )
  } else {
    body = (
      <>
        <NextLink href='/login'>
          <Link color='white' mr={2}>
            login
          </Link>
        </NextLink>
        <NextLink href='/register'>
          <Link color='white' mr={2}>
            register
          </Link>
        </NextLink>
      </>
    )
  }

  return (
    <Flex bg='tan' p={4}>
      <Box ml={'auto'}>{body}</Box>
    </Flex>
  )
}

export default NavBar
