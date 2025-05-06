// pages/DashboardPage.js
import React, {useCallback, useEffect, useState} from "react";
import {
  AutoComplete,
  Avatar,
  Button,
  Col,
  ConfigProvider,
  Form,
  Input,
  Layout,
  List,
  Row,
  Select,
  Space,
  Statistic,
  Typography
} from "antd";
import {debounce} from "lodash";
import supabase from "../supabase.js";
import VirtualList from 'rc-virtual-list';
import {SwipeAction} from "antd-mobile";
import {CheckOutlined, HeartFilled, HeartOutlined, RollbackOutlined} from "@ant-design/icons";
import {Navigate, useNavigate} from "react-router-dom";

function SearchPage() {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [focalLeader, setFocalLeader] = useState(null);
  const [focalLeaders, setFocalLeaders] = useState([]);
  const [liner, setLiner] = useState(null);
  const [loginUser, setLoginUser] = useState(null);

  useEffect(()=>{
    const getUserInfo = async()=>{
      const {data, error} = await supabase.auth.getUser()
      // console.log('user',data.user)
      setLoginUser(data.user)
    }
    getUserInfo()
  },[])

  const debouncedUpdate = useCallback(
    debounce(async ({fp, text, position}) => {
      // console.log({fp, text, position})
      if (!text && position === 'liner') {
        // console.log(`searching "${fp}" for liner: "${text}"`);

        const {data, error} = await supabase
          .from('vuBue8Fiesa3')
          .select('*')
          .eq('fp', fp)
          .order('liner', 'ascending')

        setData(data);

        return
      }

      if (text && position === 'liner' && fp) {
        // console.log(`searching "${fp}" for liner: "${text}"`);

        let tts = text.trim().split(' ').join(':* & ').concat(`:*`)
        // // console.log(tts)

        const {data, error} = await supabase
          .from('vuBue8Fiesa3')
          .select('*')
          .eq('fp', fp)
          .textSearch(
            'liner', tts
          )
          .order('liner', 'ascending')

        setData(data);

        return
      }

      // console.log(`searching fp "${text}"`);

      let tts = text.split(' ').join(':* & ').concat(`:*`)

      const table = position === 'fp' ? 'vubue8fiesa3_fp' : 'vuBue8Fiesa3'

      const {data, error} = await supabase
        .from(table)
        .select('*')
        .textSearch(
          position, `${tts}`
        )
        .order('fp', 'ascending')

      if (position === 'fp') {
        // console.log(data)
        setFocalLeaders((data || [])
          .map(v => ({
            label: <b style={{textTransform: 'uppercase'}}>{v.fp.trim()}</b>,
            value: v.fp
          })))
      }
      if (position === 'liner') {
        setData(data);
      }

    }, 500),
    []
  );

  const markAsDone = async (user) => {
    const {data, error} = await supabase.from('vuBue8Fiesa3')
      .update({
        status: 1,
        updated_at: new Date(),
        updated_by: loginUser.id
      })
      .eq('id', user.id)

    debouncedUpdate({text: liner, position: 'liner', fp: focalLeader});

    // setData(data)
  }

  const markAsUndone = async (user) => {
    const {data, error} = await supabase.from('vuBue8Fiesa3')
      .update({
        status: 0,
        updated_at: new Date(),
        updated_by: loginUser.id
      })
      .eq('id', user.id)

    debouncedUpdate({text: liner, position: 'liner', fp: focalLeader});
  }

  const onSelect = value => {
    // console.log(`selected ${value}`);
    setFocalLeader(value);

    debouncedUpdate({fp: value, text: '', position: 'liner'});
  };

  const onSearch = value => {
    // console.log('search:', value);
  };

  return (
    <Layout style={{height: '100vh', width: '100vw'}}>
      <Row size={5} direction="vertical" style={{height: 110, padding: '10px 5px 10px 5px', width: '100%'}}>
        <Form
          name="searchForm"
          style={{width: '100%'}}
          size="large"
          onValuesChange={({liner}) => {
            setLiner(liner)
            debouncedUpdate({text: liner, position: 'liner', fp: focalLeader});
          }}
        >
          <Space direction="vertical" style={{width: '100%'}}>
            <Form.Item name="focal_leader" noStyle>
              <AutoComplete
                style={{width: '100%'}}
                options={focalLeaders}
                size='large'
                onSelect={onSelect}
                onSearch={text => {
                  debouncedUpdate({text, position: 'fp'});
                }}
                allowClear
                placeholder="Focal Leader"
              />
            </Form.Item>

            <Form.Item name="liner" noStyle>
              <Input
                size={"large"}
                placeholder="Liner"
                allowClear
              />
            </Form.Item>
          </Space>
        </Form>
      </Row>
      <Row style={{width: '100%', height: '100%', overflowY: 'hidden'}}>
        <List style={{width: '100%', height: '100%', overflowY: 'auto'}} rowKey="id">
          <VirtualList
            data={data}
            height="100%"
            itemKey="id"
            onScroll={() => {
            }}
          >
            {(user) => (
              <SwipeAction
                key={user.id}
                rightActions={[
                  {
                    key: "done",
                    text: <CheckOutlined style={{fontWeight: 700, fontSize: '24px', color: '#24AC58'}}/>,
                    color: 'light',
                    onClick: () => markAsDone(user)
                  },
                ]}
                leftActions={[
                  {key: "undo", text: <RollbackOutlined/>, color: "light", onClick: () => markAsUndone(user)},
                ]}
                style={{
                  margin: '0 5px 0 5px'
                }}
              >
                <List.Item style={{margin: '0 10px 0 10px'}}>
                  <List.Item.Meta
                    title={<div
                      style={{textTransform: 'uppercase'}}>{user.liner}</div>}
                    description={<Space>
                      {/*<b>{user.precinct_no}</b>*/}
                      <Typography.Text
                        style={{textTransform: 'capitalize'}}
                      >
                        {user.address}
                      </Typography.Text>
                    </Space>
                    }
                  />
                  {user.status === 1 && <HeartFilled style={{fontSize: '24px', color: '#24AC58'}}/>}
                </List.Item>
              </SwipeAction>
            )}
          </VirtualList>
        </List>
      </Row>
      <Row align="bottom" style={{height: 60, bottom: 0, width: '100%'}}>
        <Button block style={{margin: 10}} size="large" onClick={()=>{navigate('/logout')}}><b>LOGOUT</b></Button>
      </Row>
    </Layout>

  );
}

export default SearchPage;
