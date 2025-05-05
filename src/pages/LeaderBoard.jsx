// pages/DashboardPage.js
import React, {useEffect, useState} from "react";
import {ConfigProvider, Layout, Progress, Row, Statistic, Table} from "antd";
import bgVideo from '../assets/Tapelect-Bg.mp4'
import supabase from "../supabase.js";

function LeaderBoard() {

  const [count, setCount] = useState(0);

  const [seedAmount, setSeedAmount] = useState(0);

  const [multiplier, setMultiplier] = useState(0);

  const [leaders, setLeaders] = useState(null);

  useEffect(() => {

    const getSeedAmount = async () => {
      const {data, error} = await supabase
        .from('tblX9A2B7GK')
        .select('*')
        .limit(1)
      console.log(data)
      setSeedAmount(data[0].seed)
      setMultiplier(data[0].multiplier)
    }

    if (!seedAmount || !multiplier) {
      getSeedAmount()
    }
  }, []);

  useEffect(() => {
    const fetchCount = async () => {
      const {data, error} = await supabase
        .from('vubue8fiesa3_by_fp')
        .select('*')
        .limit(100)

      if (data) setLeaders(data);
    };

    fetchCount(); // Initial count

    const subscription = supabase
      .channel("vubue8fiesa3_changes")
      .on("postgres_changes", {event: "*", schema: "public", table: "vuBue8Fiesa3"}, () => {
        fetchCount(); // Fetch new count on change
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription); // Cleanup subscription
    };
  }, []);

  return (
    <Layout style={{width: '100vw', height: '100vh', margin: 0, padding: 0}}>
      <Table
        rowKey='fp'
        dataSource={leaders}
        size="small"
        columns={[
          {
            title: 'Focal Person',
            dataIndex: 'fp',
            render: (d) => (<span style={{textTransform: 'capitalize'}}>{d}</span> )
          }, {
            title: 'Barangay',
            dataIndex: 'barangay',
            align: 'left',
            render: (d) => (<span style={{textTransform: 'capitalize'}}>{d}</span> )
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
            render: (_, record)=>{
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
                    percent={parseInt((record.status_1/record.total)*100)}
                    percentPosition={{ align: 'center', type: 'inner' }}
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
