// pages/DashboardPage.js
import React, {useCallback, useEffect, useState} from "react";
import {
  Button,
  Dropdown,
  Flex, Form,
  Grid, Input,
  Layout, Select,
  Table,
} from "antd";
import bgVideo from '../assets/Tapelect-Bg.mp4'
import supabase from "../supabase.js";
import {debounce} from "lodash";
import * as sea from "node:sea";
import {HeartFilled} from "@ant-design/icons";
import dayjs from "dayjs";

const {useBreakpoint} = Grid

function ExportPage() {
  const [liners, setLiners] = useState(null);
  const [pagination, setPagination] = useState({current: 1, pageSize: 10});

  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState(null);

  const screens = useBreakpoint()

  const fetchData = async (page, pageSize, filter) => {
    // setLoading(true);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize - 1

    const query = supabase
      .from('vuBue8Fiesa3')
      .select('*', {count: 'exact'})
      .range(startIndex, endIndex)
    if (filter?.barangay) {
      query.ilike('barangay', `%${filter.barangay}%`)
    }
    if (filter?.status) {
      query.eq('status', filter.status)
    }
    const {data, count, error} = await query
    return {
      data: data, total: count,
    }
  };

  useEffect(() => {
    const loadData = async (filter) => {

      const {data, total} = await fetchData(pagination.current, pagination.pageSize, filter)

      if (data) {
        setLiners(data);
        setPagination((prev) => ({...prev, total: total})); // Update total count
      }
    }

    loadData(filter)

  }, [pagination.current, pagination.pageSize, filter]);

  const debounceSearch = useCallback(
    debounce((values) => {
      setFilter((prev)=>({...prev, ...values}));
    }, 500))

  return (
    <Layout style={{
      width: '100vw', height: '100vh', margin: 0, padding: 0, overflowX: 'auto',
      minWidth: 350
    }}>
      <Flex className="background-color" style={{marginTop: 20}} vertical>
        <Flex justify="space-between" align="center" style={{marginRight: 10, width: '100%'}}>
          <Form
            layout="inline"
            style={{margin: '20px 0 10px 10px'}}
            onValuesChange={(values) => {
              debounceSearch(values)
            }}
            onFinish={async (filter) => {
              const query = supabase
                .from('vuBue8Fiesa3')
                .select('barangay, fp, liner, status, updated_at')
              if (filter?.barangay) {
                query.ilike('barangay', `%${filter.barangay}%`)
              }
              if (filter?.status) {
                query.eq('status', filter.status)
              }
              const {data, error} = await query.csv()
              if (!error) {
                const now = dayjs().format('YYYYMMDDHHmmss')
                let status = ''
                if(filter.status==='1'){
                  status = '-claimed'
                } else if(filter.status==='0'){
                  status = '-unclaimed'
                }
                let barangay='all'
                if(filter.barangay){
                  barangay = `-${liners[0].barangay}`
                }
                const filename = `export-${barangay}${status}-${now}.csv`
                const csvContent = "data:text/csv;charset=utf-8," + data;
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", filename);
                document.body.appendChild(link);
                link.click();
              }
            }}
            size={'large'}
          >
            <Form.Item name="barangay">
              <Input placeholder="SEARCH BARANGAY" allowClear></Input>
            </Form.Item>
            <Form.Item name="status">
              <Select
                style={{width: 150}}
                options={[
                  {value: '0', label: <span>UNCLAIMED</span>},
                  {value: '1', label: <span>CLAIMED</span>}
                ]}
                placeholder="STATUS"
                allowClear
              />
            </Form.Item>
            <Form.Item >
              <Button htmlType="submit">DOWNLOAD CSV</Button>
            </Form.Item>
          </Form>
        </Flex>
        <Table
          style={{padding: 10, minWidth: 200}}
          rowKey='id'
          dataSource={liners}
          size="small"
          scroll={{y: `calc(100vh - ${screens.xs ? '150' : '300'}px)`, x: "calc(100vh - 200px)"}}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            onChange: (page, pageSize) => {
              setPagination({current: page, pageSize})
            },
          }}
          loading={loading}
          columns={[
            {
              title: 'BARANGAY',
              dataIndex: 'barangay',
              align: 'left',
              width: '150px',
              render: (d) => (<span style={{textTransform: 'uppercase', fontWeight: 600}}>{d}</span>)
            },
            {
              title: 'FOCAL PERSON',
              dataIndex: 'fp',
              width: 300,
              render: (d) => (<span style={{textTransform: 'uppercase', fontWeight: 600}}>{d}</span>)
            }, {
              title: 'LINERS',
              dataIndex: 'liner',
              render: (d) => (<span style={{textTransform: 'uppercase', fontWeight: 600}}>{d}</span>)
            }, {
              title: 'STATUS',
              dataIndex: 'status',
              sortOrder: 'descend',
              width: '150px',
              render: (d) => (
                <span style={{textTransform: 'uppercase', fontWeight: 600, color: '#24AC58'}}>{d ? <HeartFilled/> : '-'}</span>)
            }, /*{
              title: 'LINERS REMAINING',
              dataIndex: 'status_0',
              align: 'right',
              width: '150px',
            }, {
              title: 'PROGRESS',
              fixed: 'right',
              width: screens.xs ? 100 : 200,
              render: (_, record) => {
                return (<ConfigProvider
                  theme={{
                    token: {
                      colorText: 'white', fontSize: 12
                    }
                  }}
                >
                  <Progress
                    percent={((record.status_1 / record.total) * 100).toPrecision(3)}
                    percentPosition={{align: 'center', type: 'inner'}}
                    size={['100%', 18]}
                    strokeColor="#24AC58"
                    trailColor="lightgray"
                    format={(percent) => (<span style={{fontWeight: 500}}>{percent}%</span>)}
                  />
                </ConfigProvider>)
              }
            },*/
          ]}
        > </Table>
      </Flex>
    </Layout>);
}

export default ExportPage;
