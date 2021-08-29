import React from 'react'
import { Formik, Form } from 'formik'
import { Box, Button } from '@chakra-ui/react'
import { useRouter } from 'next/router'

// components
import Wrapper from '../components/Wrapper'
import InputField from '../components/InputField'

// hook by graphql
import { useLoginMutation } from '../generated/graphql'

// object to array error mapping
import { toErrorMap } from '../utils/toErrorMap'

interface loginProps {}

const Login: React.FC<loginProps> = ({}) => {
  const router = useRouter()
  const [, login] = useLoginMutation()

  return (
    <Wrapper>
      <Formik
        initialValues={{ username: '', password: '' }}
        onSubmit={async (values, { setErrors }) => {
          const response = await login({ options: values })
          if (response.data && response.data.login.errors) {
            setErrors(toErrorMap(response.data.login.errors))
          } else if (response.data && response.data.login.user) {
            //worked
            router.push('/')
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <Box mt={4}>
              <InputField
                name='username'
                placeholder='username'
                label='username'
              />
            </Box>
            <Box mt={4}>
              <InputField
                name='password'
                placeholder='password'
                label='password'
                type='password'
              />
            </Box>
            <Button
              mt={4}
              isLoading={isSubmitting}
              colorScheme='teal'
              type='submit'
            >
              Login
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  )
}

export default Login
