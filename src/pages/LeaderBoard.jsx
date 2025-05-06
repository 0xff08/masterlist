// pages/DashboardPage.js
import React, {useEffect, useState} from "react";
import {Card, Col, ConfigProvider, Flex, Layout, Progress, Row, Statistic, Table, Typography} from "antd";
import bgVideo from '../assets/Tapelect-Bg.mp4'
import supabase from "../supabase.js";

function LeaderBoard() {

  const [count, setCount] = useState(0);
  const [seedAmount, setSeedAmount] = useState(0);
  const [multiplier, setMultiplier] = useState(0);
  const [leaders, setLeaders] = useState(null);
  const [overall, setOverall] = useState(false);
  const [pagination, setPagination] = useState(
    {current: 1, pageSize: 10, total: null, currentPage: 1}
  );

  const [loading, setLoading] = useState(false);

  const fetchCount = async (page, pageSize) => {
    setLoading(true);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize - 1

    const {data, error} = await supabase
      .from('vubue8fiesa3_by_fp')
      .select('*')
      .range(startIndex, endIndex);

    if (data) {
      setPagination((prev) => ({...prev, total: overall.total_fp})); // Update total count
      setLeaders(data);
      setLoading(false);
    }
  };

  const fetchOverall = async () => {
    const {data, error} = await supabase
      .from('vubue8fiesa3_status_by_fp')
      .select('*')
      .limit(100)
    setOverall(data[0])
  }

  useEffect(() => {

    if (!overall?.total_fp && !pagination.total) {
      setPagination((prev) => ({...prev, total: overall.total_fp})); // Update total count
    }

  }, [overall]);

  useEffect(() => {
    const getSeedAmount = async () => {
      const {data, error} = await supabase
        .from('tblX9A2B7GK')
        .select('*')
        .limit(1)
      setSeedAmount(data[0].seed)
      setMultiplier(data[0].multiplier)
    }

    if (!seedAmount || !multiplier) {
      getSeedAmount()
    }

    fetchOverall()

    const subscription = supabase
      .channel("vubue8fiesa3_changes")
      .on("postgres_changes", {event: "*", schema: "public", table: "vuBue8Fiesa3"}, () => {
        fetchCount(); // Fetch new count on change
        fetchOverall()
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription); // Cleanup subscription
    };

  }, []);

  useEffect(() => {
    fetchCount(pagination.current, pagination.pageSize); // Initial count
  }, [pagination.current, pagination.pageSize]);

  const twoColors = {
    '0%': '#108ee9',
    '100%': '#87d068',
  };

  const conicColors = {
    '0%': '#87d068',
    '50%': '#ffe58f',
    '100%': '#ffccc7',
  };

  return (
    <Layout style={{width: '100vw', height: '100vh', margin: 0, padding: 0}}>
      <Row gutter={10} style={{margin: '20px 5px 10px 5px'}}>
        <Col span={12}>
          <Card variant="borderless">
            <Flex justify="space-between" align={'center'}>
              <Statistic
                title="Completed Focal Person"
                value={overall.completed_fp}
                precision={0}
                valueStyle={{color: '#3f8600'}}
                suffix={<> / {new Intl.NumberFormat('en-US').format(overall.total_fp)}</>}
              />
              <Progress size={100} percent={parseInt((overall.completed_fp / overall.total_fp) * 100)}
                        type='dashboard' strokeColor='#3f8600'/>
            </Flex>
          </Card>
        </Col>
        <Col span={12}>
          <Card variant="borderless">
            <Flex justify="space-between" align={'center'}>
              <Statistic
                title="Completed Liners"
                value={overall.completed_liners}
                precision={0}
                valueStyle={{color: '#3f8600'}}
                suffix={<> / {new Intl.NumberFormat('en-US').format(overall.total_liners)}</>}
              />
              <Progress size={100} percent={parseInt((overall.completed_liners / overall.total_liners) * 100)}
                        type='dashboard' strokeColor='#3f8600'/>
            </Flex>
          </Card>
        </Col>
      </Row>
      <Table
        style={{margin: 10}}
        rowKey='fp'
        dataSource={leaders}
        size="small"
        scroll={{y: 800}}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total, // Ensure total count is set
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
          onChange: (page, pageSize) => setPagination({current: page, pageSize}),
        }}
        loading={loading}
        columns={[
          {
            title: 'Focal Person',
            dataIndex: 'fp',
            render: (d) => (<span style={{textTransform: 'capitalize'}}>{d}</span>)
          }, {
            title: 'Barangay',
            dataIndex: 'barangay',
            align: 'left',
            render: (d) => (<span style={{textTransform: 'capitalize'}}>{d}</span>)
          },
          {
            title: 'Members Total',
            dataIndex: 'total',
            align: 'right'
          }, {
            title: 'Members Received',
            dataIndex: 'status_1',
            align: 'right',
            sortOrder: 'descend',
          }, {
            title: 'Members Remaining',
            dataIndex: 'status_0',
            align: 'right'
          },
          {
            title: 'Progress',
            render: (_, record) => {
              return (
                <ConfigProvider
                  theme={{
                    token: {
                      colorText: 'white',
                      fontSize: 12
                    }
                  }}
                >
                  <Progress
                    percent={parseInt((record.status_1 / record.total) * 100)}
                    percentPosition={{align: 'center', type: 'inner'}}
                    size={[200, 15]}
                    strokeColor="#24AC58"
                    trailColor="lightgray"
                  />
                </ConfigProvider>
              )
            }
          },

        ]}
      ></Table>

    </Layout>
  );
}

export default LeaderBoard;
