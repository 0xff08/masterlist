// pages/DashboardPage.js
import React, {useEffect, useState} from "react";
import {Card, Col, ConfigProvider, Flex, Layout, Pagination, Progress, Row, Statistic, Table, Typography} from "antd";
import bgVideo from '../assets/Tapelect-Bg.mp4'
import supabase from "../supabase.js";

function LeaderBoard() {

  const [count, setCount] = useState(0);
  const [seedAmount, setSeedAmount] = useState(0);
  const [multiplier, setMultiplier] = useState(0);
  const [leaders, setLeaders] = useState(null);
  const [overall, setOverall] = useState(false);
  const [pagination, setPagination] = useState(
    {current: 1, pageSize: 10}
  );

  const [loading, setLoading] = useState(false);

  const fetchData = async (page, pageSize) => {
    // setLoading(true);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize - 1

    const {data, count, error} = await supabase
      .from('vubue8fiesa3_by_fp')
      .select('*', {count: 'exact'})
      .range(startIndex, endIndex);

    return {
      data: data,
      total: count,
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
    const getSeedAmount = async () => {
      const {data, error} = await supabase
        .from('tblX9A2B7GK')
        .select('*')
        .limit(1)
      setSeedAmount(data[0].seed)
      setMultiplier(data[0].multiplier)
    }

    getSeedAmount()

    fetchOverall()
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const {data, total} = await fetchData(pagination.current, pagination.pageSize)
      if (data) {
        setLeaders(data);
        setPagination((prev) => ({...prev, total: total})); // Update total count
      }
    }

    loadData()

    const subscription = supabase
      .channel("vubue8fiesa3_changes")
      .on("postgres_changes", {event: "*", schema: "public", table: "vuBue8Fiesa3"}, () => {
        loadData(); // Fetch new count on change
        fetchOverall()
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription); // Cleanup subscription
    };
  }, [pagination.current, pagination.pageSize]);

  return (
    <Layout style={{width: '100vw', height: '100vh', margin: 0, padding: 0, overflowY: 'hidden'}}>
      <Row gutter={10} style={{margin: '20px 5px 10px 5px'}}>
        <Col span={8}>
          <Card variant="borderless">
            <Flex justify="space-between" align={'center'}>
              <Statistic
                title="Focal Person In-Progress"
                value={overall.in_progress_fp-overall.completed_fp}
                precision={0}
                valueStyle={{color: '#ff6a00'}}
                suffix={<> / {new Intl.NumberFormat('en-US').format(overall.total_fp-overall.completed_fp)}</>}
              />
              <Progress size={100} percent={((overall.in_progress_fp / (overall.total_fp-overall.completed_fp)) * 100).toPrecision(3)}
                        type='dashboard' strokeColor='#3f8600'/>
            </Flex>
          </Card>
        </Col>
        <Col span={8}>
          <Card variant="borderless">
            <Flex justify="space-between" align={'center'}>
              <Statistic
                title="Focal Person Completed"
                value={overall.completed_fp}
                precision={0}
                valueStyle={{color: '#3f8600'}}
                suffix={<> / {new Intl.NumberFormat('en-US').format(overall.total_fp)}</>}
              />
              <Progress size={100} percent={((overall.completed_fp / overall.total_fp) * 100).toPrecision(3)}
                        type='dashboard' strokeColor='#3f8600'/>
            </Flex>
          </Card>
        </Col>
        <Col span={8}>
          <Card variant="borderless">
            <Flex justify="space-between" align={'center'}>
              <Statistic
                title="Liners Completed"
                value={overall.completed_liners}
                precision={0}
                valueStyle={{color: '#3f8600'}}
                suffix={<> / {new Intl.NumberFormat('en-US').format(overall.total_liners)}</>}
              />
              <Progress size={100} percent={((overall.completed_liners / overall.total_liners) * 100).toPrecision(3)}
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
        scroll={{y: "calc(100vh - 300px)"}}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total, // Ensure total count is set
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
          onChange: (page, pageSize) => {
            setPagination({current: page, pageSize})
          },
        }}
        loading={loading}
        columns={[
          {
            title: 'Focal Person',
            dataIndex: 'fp',
            width: '300px',
            fixed: 'left',
            render: (d) => (<span style={{textTransform: 'capitalize'}}><b>{d}</b></span>)
          }, {
            title: 'Barangay',
            dataIndex: 'barangay',
            align: 'left',
            width: '80px',
            fixed: 'left',
            render: (d) => (<span style={{textTransform: 'capitalize'}}>{d}</span>)
          },
          {
            title: 'Liners Total',
            dataIndex: 'total',
            align: 'right',
          }, {
            title: 'Liners Completed',
            dataIndex: 'status_1',
            align: 'right',
            sortOrder: 'descend',
          }, {
            title: 'Liners Remaining',
            dataIndex: 'status_0',
            align: 'right',
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
                    percent={((record.status_1 / record.total) * 100).toPrecision(3)}
                    percentPosition={{align: 'center', type: 'inner'}}
                    size={['100%', 18]}
                    strokeColor="#24AC58"
                    trailColor="lightgray"
                    format={(percent)=>(<span style={{fontWeight: 500}}>{percent}%</span>)}
                  />
                </ConfigProvider>
              )
            }
          },

        ]}
        // footer={
        //
        // }
      ></Table>

    </Layout>
  );
}

export default LeaderBoard;
