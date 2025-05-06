import {Button, Col, Form, Input, Layout, Row} from "antd";
import supabase from "../supabase.js";

function Debug() {
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
            // // console.log(users);
            users.trim().split('\n').map(async(line) => {
              const [email, password] = line.split('\t')

              const { data, error } = await supabase.auth.signUp({
                email: email.trim(),
                password: password.trim()
              })

              // console.log({data, error})
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