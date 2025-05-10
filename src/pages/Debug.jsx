import {Button, Col, Form, Input, Layout, Row} from "antd";
import supabase from "../supabase.js";

function Debug() {


  async function createUser(email, password) {
// console.log({email, password});
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password
    })

    // if (error) {
    //   console.error('Error creating user:', error.message);
    // } else {
    //   console.log('User created:', data);
    // }
  }


  return (
    <Layout style={{
      width: '100vw',
      height: '100vh'
    }}>
      <Row>

        <Form
          style={{
            width: '600px'
          }}
          layout={'horizontal'}
          onFinish={({users})=>{
            const usersList = users.trim().split('\n').map((line) => {
              const [email, password] = line.split('\t')
              return {email: email.trim(), password: password.trim()};
            })
            usersList.forEach(async (user) => {
              await createUser(user.email, user.password);
            })
          }}
        >
          <Form.Item name={'users'}>
            <Input.TextArea style={{
              minWidth: '600px',
              minHeight: '500px',
            }}/>
          </Form.Item>
          <Form.Item >
            <Button htmlType={'submit'} block>Add Users</Button>
          </Form.Item>
        </Form>
      </Row>
    </Layout>
  )
}

export default Debug;