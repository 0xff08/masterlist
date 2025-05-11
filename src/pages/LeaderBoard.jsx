// pages/DashboardPage.js
import React, {useCallback, useEffect, useState} from "react";
import {
  Card,
  Col,
  ConfigProvider,
  Flex, Form,
  Grid, Input,
  Layout,
  Progress,
  Row, Select, Space,
  Statistic,
  Table, Typography,
} from "antd";
import supabase from "../supabase.js";
import {debounce} from "lodash";
import dayjs from "dayjs";
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

const {useBreakpoint} = Grid

function useThrottledRequest(callback, delay = 2000) {
  const [lastRequestTime, setLastRequestTime] = useState(0);

  const makeRequest = (...args) => {
    const now = Date.now();
    if (now - lastRequestTime >= delay) {
      setLastRequestTime(now);
      callback(...args); // Execute the request
    }
  };

  return makeRequest;
}

function LeaderBoard() {
  const [leaders, setLeaders] = useState([]);
  const [overall, setOverall] = useState({});
  const [pagination, setPagination] = useState({current: 1, pageSize: 10});
  const [loading, setLoading] = useState(false);
  const [searchBarangay, setSearchBarangay] = useState("");
  const [groupBy, setGroupBy] = useState('fp');
  const [barangayStatus, setBarangayStatus] = useState(false);
  const [now, setNow] = useState(dayjs().utc());
  const [filter, setFilter] = useState({barangay: '', groupBy: 'fp'});

  const screens = useBreakpoint()

  useEffect(() => {
    fetchOverall(searchBarangay)
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(dayjs().utc())
    }, 1000);

    return () => clearInterval(interval);
  }, [leaders]);

  const fetchData = async (page, pageSize, searchBarangay, groupBy = 'fp') => {
    // setLoading(true);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize - 1

    const query = supabase
      .from(`vubue8fiesa3_by_${groupBy}`)
      .select('*', {count: 'exact'})

    if (searchBarangay) {
      query.ilike('barangay', `%${searchBarangay}%`)
    }

    // console.log({searchBarangay, groupBy})
    const {data, count, error} = await query.range(startIndex, endIndex)

    return {
      data: data, total: count,
    }
  };

  const fetchOverall = async (searchText, groupBy) => {
    if (searchText) {
      const {data, error} = await supabase.rpc('get_barangay_status', {
        text_to_search: searchText
      })
      if (data) setBarangayStatus(data)
    }

    const {data, error} = await supabase
      .from('vubue8fiesa3_status_by_fp')
      .select('*')
      .limit(10)

    setOverall(data[0])
  }

  const loadData = async (searchBarangay, groupBy) => {

    const {data, total} =
      await fetchData(pagination.current, pagination.pageSize, searchBarangay, groupBy)

    if (data) {
      setLeaders(data);
      setPagination((prev) => ({...prev, total: total})); // Update total count
    }
  }

  const fetchOverallData = (searchText, groupBy) => {
    loadData(searchText, groupBy).then(() => {
      setLoading(false);
    })
    fetchOverall(searchText, groupBy)
  }

  const throttledFetch = useThrottledRequest(fetchOverallData)

  useEffect(() => {

    throttledFetch(filter.barangay, filter.groupBy)

    const subscription = supabase
      .channel("vubue8fiesa3_changes")
      .on("postgres_changes", {event: "*", schema: "public", table: "vuBue8Fiesa3"}, () => {
        throttledFetch(filter.barangay, filter.groupBy)
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription); // Cleanup subscription
    };
  }, [pagination.current, pagination.pageSize, filter]);

  const debounceSearch = useCallback(
    debounce((barangay, groupBy) => {
      setFilter({
        barangay,
        groupBy
      })
      setLoading(true)
    }, 1000))

  const getColumns = () => {
    let cols = [{
      title: 'UPDATED AT',
      dataIndex: 'updated_at',
      align: 'right',
      width: '150px',
      render: (d) => {
        const start = dayjs.utc(d)
        const end = now
        let elapsedSeconds = end.diff(start, 'seconds');
        elapsedSeconds = elapsedSeconds < 0 ? 1 : elapsedSeconds;
        const days = Math.floor((elapsedSeconds / 3600) / 24);
        const hours = Math.floor((elapsedSeconds / 3600) % 24);
        const minutes = Math.floor((elapsedSeconds % 3600) / 60);
        const seconds = (elapsedSeconds % 60);
        return (<span style={{fontWeight: 600}}>
                {days ? `${days}d` : ''} {hours ? `${hours}h` : ''} {minutes ? `${minutes}m` : ''} {seconds ? `${seconds}s` : '0s'} ago</span>)
      }
    }, {
      title: 'BARANGAY',
      dataIndex: 'barangay',
      align: 'left',
      width: '150px',
      render: (d) => (<span style={{textTransform: 'uppercase', fontWeight: 700}}>{d}</span>)
    }, {
      title: 'FOCAL PERSON',
      dataIndex: 'fp',
      width: 300,
      render: (d) => (<span style={{textTransform: 'uppercase', fontWeight: 600}}>{d}</span>)
    }, {
      title: 'LINERS TOTAL', dataIndex: 'total', align: 'right',
      width: '150px',
    }, {
      title: 'LINERS COMPLETED', dataIndex: 'status_1', align: 'right', sortOrder: 'descend',
      width: '150px',
    }, {
      title: 'LINERS REMAINING', dataIndex: 'status_0', align: 'right',
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
    },]

    return cols.filter(col => filter.groupBy !== 'fp' ? col.dataIndex !== 'fp' : true)
  }

  return (
    <Layout style={{
      width: '100vw', height: '100vh', margin: 0, padding: 0, overflowX: 'auto',
      minWidth: 350
    }}>
      <Flex
        vertical
        className="background-color"
      >
        <Row style={{margin: '20px 0 0px 10px'}}>
          <Col span={24}>
            <div style={{fontWeight: 700, fontSize: '12pt', color: 'white'}}>OVERALL STATUS</div>
          </Col>
        </Row>
        <Row>
          <Col
            xxl={4} xl={8} lg={12} md={12} sm={12} xs={24}
            style={{padding: '10px'}}
          >
            <Card variant="borderless">
              <Flex justify="space-between" align={'center'} style={{width: '100%'}}>
                <Statistic
                  title={
                    <span style={{fontWeight: 500}}>FOCAL PERSON<br/>REMAINING</span>
                  }
                  value={overall.total_fp - (overall.in_progress_fp)}
                  precision={0}
                  valueStyle={{color: '#706e6e'}}
                  suffix={<> / {new Intl.NumberFormat('en-US').format(overall.total_fp)}</>}
                />
                <Progress
                  size={100}
                  percent={(((overall.total_fp - (overall.in_progress_fp)) / (overall.total_fp)) * 100).toPrecision(3)}
                  type='dashboard'
                  strokeColor='#706e6e'/>
              </Flex>
            </Card>
          </Col>
          <Col
            xxl={4} xl={8} lg={12} md={12} sm={12} xs={24}
            style={{padding: '10px'}}
          >
            <Card variant="borderless">
              <Flex justify="space-between" align={'center'}>
                <Statistic
                  title={
                    <span style={{fontWeight: 500}}>FOCAL PERSON<br/>IN-PROGRESS</span>
                  }
                  value={overall.in_progress_fp - overall.completed_fp}
                  precision={0}
                  valueStyle={{color: '#ff6a00'}}
                  suffix={<> / {new Intl.NumberFormat('en-US').format(overall.total_fp - overall.completed_fp)}</>}
                />
                <Progress size={100}
                          percent={(((overall.in_progress_fp - overall.completed_fp)/ (overall.total_fp - overall.completed_fp)) * 100).toPrecision(3)}
                          type='dashboard' strokeColor='#ff6a00'/>
              </Flex>
            </Card>
          </Col>
          <Col
            xxl={4} xl={8} lg={12} md={12} sm={24} xs={24}
            style={{padding: '10px'}}
          >
            <Card variant="borderless">
              <Flex justify="space-between" align={'center'}>
                <Statistic
                  title={
                    <span style={{fontWeight: 500}}>FOCAL PERSON<br/>COMPLETED</span>
                  }
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
          <Col
            xxl={6} xl={12} lg={12} md={12} sm={24} xs={24}
            style={{padding: '10px'}}
          >
            <Card variant="borderless">
              <Flex justify="space-between" align={'center'}>
                <Statistic
                  title={
                    <span style={{fontWeight: 500}}>LINERS<br/>COMPLETED</span>
                  }
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
          <Col
            xxl={6} xl={12} lg={24} md={24} sm={24} xs={24}
            style={{padding: '10px'}}
          >
            <Card variant="borderless">
              <Flex justify="space-between" align={'center'}>
                <Statistic
                  title={
                    <span style={{fontWeight: 500}}>LINERS<br/>REMAINING</span>
                  }
                  value={overall.total_liners - overall.completed_liners}
                  precision={0}
                  valueStyle={{color: '#646563'}}
                  suffix={<> / {new Intl.NumberFormat('en-US').format(overall.total_liners)}</>}
                />
                <Progress size={100}
                          percent={(((overall.total_liners - overall.completed_liners) / overall.total_liners) * 100).toPrecision(3)}
                          type='dashboard' strokeColor='#646563'/>
              </Flex>
            </Card>
          </Col>
        </Row>
      </Flex>
      <Flex className="background-color" style={{marginTop: 20}} vertical>
        <Form
          style={{
            margin: '20px 10px 10px 10px'
          }}
          onValuesChange={(_, {barangay, groupBy}) => {
            // console.log({barangay, groupBy});
            debounceSearch(barangay, groupBy)
          }}
          size={'large'}
        >
          <Row justify='space-between'>
            <Col>
              <Form.Item name="barangay" noStyle>
                <Input placeholder="SEARCH BARANGAY" allowClear></Input>
              </Form.Item>
            </Col>
            <Col>
              <Form.Item name='groupBy' noStyle initialValue='fp'>
                <Select
                  style={{
                    width: '200px'
                  }}
                  placeholder="GROUP BY"
                  options={[
                    {
                      label: 'FOCAL PERSON', value: 'fp',
                    }, {
                      label: 'BARANGAY', value: 'barangay',
                    },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
        {searchBarangay && <Row style={{marginTop: 10}}>
          <Col
            xxl={5} xl={8} lg={12} md={12} sm={12} xs={24}
            style={{padding: '5px 10px 5px 10px'}}
          >
            <Card variant="borderless">
              <Flex justify="space-between" align={'center'} style={{width: '100%'}}>
                <Statistic
                  title={
                    <span style={{fontWeight: 500}}>FOCAL PERSON<br/>REMAINING</span>
                  }
                  value={barangayStatus.total_fp - (barangayStatus.in_progress_fp + barangayStatus.completed_fp)}
                  precision={0}
                  valueStyle={{color: '#706e6e'}}
                  suffix={<> / {new Intl.NumberFormat('en-US').format(barangayStatus.total_fp)}</>}
                />
                <Progress
                  size={100}
                  percent={(((barangayStatus.total_fp - (barangayStatus.in_progress_fp + barangayStatus.completed_fp)) / (barangayStatus.total_fp)) * 100).toPrecision(3)}
                  type='dashboard'
                  strokeColor='#706e6e'/>
              </Flex>
            </Card>
          </Col>
          <Col xxl={5} xl={8} lg={12} md={12} sm={12} xs={24}
               style={{padding: '5px 10px 5px 10px'}}
          >
            <Card variant="borderless">
              <Flex justify="space-between" align={'center'}>
                <Statistic
                  title={
                    <span style={{fontWeight: 500}}>FOCAL PERSON<br/>IN-PROGRESS</span>
                  }
                  value={barangayStatus.in_progress_fp}
                  precision={0}
                  valueStyle={{color: '#ff6a00'}}
                  suffix={<> / {new Intl.NumberFormat('en-US').format(barangayStatus.total_fp - barangayStatus.completed_fp)}</>}
                />
                <Progress size={100}
                          percent={((barangayStatus.in_progress_fp / (barangayStatus.total_fp - barangayStatus.completed_fp)) * 100).toPrecision(3)}
                          type='dashboard' strokeColor='#ff6a00'/>
              </Flex>
            </Card>
          </Col>
          <Col xxl={4} xl={8} lg={12} md={12} sm={24} xs={24}
               style={{padding: '5px 10px 5px 10px'}}
          >
            <Card variant="borderless">
              <Flex justify="space-between" align={'center'}>
                <Statistic
                  title={
                    <span style={{fontWeight: 500}}>FOCAL PERSON<br/>COMPLETED</span>
                  }
                  value={barangayStatus.completed_fp}
                  precision={0}
                  valueStyle={{color: '#3f8600'}}
                  suffix={<> / {new Intl.NumberFormat('en-US').format(barangayStatus.total_fp)}</>}
                />
                <Progress size={100}
                          percent={((barangayStatus.completed_fp / barangayStatus.total_fp) * 100).toPrecision(3)}
                          type='dashboard' strokeColor='#3f8600'/>
              </Flex>
            </Card>
          </Col>
          <Col xxl={5} xl={12} lg={12} md={12} sm={24} xs={24}
               style={{padding: '5px 10px 5px 10px'}}
          >
            <Card variant="borderless">
              <Flex justify="space-between" align={'center'}>
                <Statistic
                  title={
                    <span style={{fontWeight: 500}}>LINERS<br/>COMPLETED</span>
                  }
                  value={barangayStatus.completed_liners}
                  precision={0}
                  valueStyle={{color: '#3f8600'}}
                  suffix={<> / {new Intl.NumberFormat('en-US').format(barangayStatus.total_liners)}</>}
                />
                <Progress size={100}
                          percent={((barangayStatus.completed_liners / barangayStatus.total_liners) * 100).toPrecision(3)}
                          type='dashboard' strokeColor='#3f8600'/>
              </Flex>
            </Card>
          </Col>
          <Col xxl={5} xl={12} lg={24} md={24} sm={24} xs={24}
               style={{padding: '5px 10px 5px 10px'}}
          >
            <Card variant="borderless">
              <Flex justify="space-between" align={'center'}>
                <Statistic
                  title={
                    <span style={{fontWeight: 500}}>LINERS<br/>REMAINING</span>
                  }
                  value={barangayStatus.total_liners - barangayStatus.completed_liners}
                  precision={0}
                  valueStyle={{color: '#646563'}}
                  suffix={<> / {new Intl.NumberFormat('en-US').format(barangayStatus.total_liners)}</>}
                />
                <Progress size={100}
                          percent={(((barangayStatus.total_liners - barangayStatus.completed_liners) / barangayStatus.total_liners) * 100).toPrecision(3)}
                          type='dashboard' strokeColor='#646563'/>
              </Flex>
            </Card>
          </Col>
        </Row>}
        <Table
          style={{padding: 10, minWidth: 200}}
          rowKey="key"
          dataSource={leaders.map((d, index) => ({...d, key: `leaders-${index}`}))}
          size="small"
          scroll={{y: `calc(100vh - ${screens.xs ? '150' : '400'}px)`, x: "calc(100vh - 200px)"}}
          pagination={{
            current: pagination.current, pageSize: pagination.pageSize, total: pagination.total, // Ensure total count is set
            showSizeChanger: true, pageSizeOptions: ["10", "20", "50", "100"], onChange: (page, pageSize) => {
              setPagination({current: page, pageSize})
            },
          }}
          loading={loading}
          rowClassName={(record, index) =>
            index % 2 === 0 ? "even-row" : "odd-row"
          }
          columns={getColumns()}
        ></Table>
      </Flex>
    </Layout>);
}

export default LeaderBoard;
