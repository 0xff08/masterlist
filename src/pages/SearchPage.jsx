// pages/DashboardPage.js
import React, {useCallback, useState} from "react";
import {signOut} from "firebase/auth";
import {auth} from "../firebase";
import {Avatar, Col, ConfigProvider, Form, Input, Layout, List, Row, Space, Statistic, Typography} from "antd";
import {debounce} from "lodash";
import supabase from "../supabase.js";
import VirtualList from 'rc-virtual-list';

function SearchPage() {
  const [data, setData] = useState([]);

  const debouncedUpdate = useCallback(
    debounce(async ({last_name, first_name, precinct_no, address}) => {
      // setFormData(values);
      const {data, error} = await supabase
        .from('dataflux827')
        .select('*')
        .ilike(`name`, `%${last_name || ''}%`)
        .ilike(`name`, `%${first_name || ''}%`)
        .ilike(`precinct`, `%${precinct_no || ''}%`)
        .ilike(`address`, `%${address || ''}%`)
        .limit(10)
      setData(data);

    }, 1000),
    []
  );

  return (
    <Col style={{height: '100%', width: '100vw'}}>
      <Row size={5} direction="vertical" style={{padding: '10px 5px 0 5px', width: '100%'}} >
        <Form
          name="searchForm"
          style={{width: '100%'}}
          size="large"
          onValuesChange={(_, allValues) => debouncedUpdate(allValues)}>
          <Space direction="vertical" style={{width:'100%'}}>
          <Form.Item name="last_name" noStyle>
            <Input size={"large"} placeholder="Last Name" allowClear/>
          </Form.Item>
          <Form.Item name="first_name" noStyle>
            <Input size={"large"} placeholder="First Name" allowClear/>
          </Form.Item>
          <Form.Item name="precinct_no" noStyle>
            <Input size={"large"} placeholder="Precinct No." allowClear/>
          </Form.Item>
          <Form.Item name="address" noStyle>
            <Input size={"large"} placeholder="Address" allowClear/>
          </Form.Item>
          </Space>
        </Form>

      </Row>
      <Row>
        <List
          style={{width: '100%', height: '900px', overflowY: 'auto', paddingLeft: '5px'}}
        >
          <VirtualList
            data={data}
            height={600}
            itemKey="uuid"
            onScroll={() => {
            }}
          >
            {(user) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar size={50} shape="square">{user.precinct}</Avatar>}
                  title={user.name}
                  description={<Space>
                    <Typography.Text>{user.address}</Typography.Text>
                    <b>{user.precinct}</b>
                  </Space>
                  }
                />
              </List.Item>
            )}
          </VirtualList>
        </List>
      </Row>
    </Col>

  );
}

export default SearchPage;
