import React,{Component} from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Modal,Table ,Button,Input, Form, Row, message, Col,DatePicker,Menu} from 'antd';
import BreadcrumbCustom from '../BreadcrumbCustom';
import WrappedAddModalForm from './components/modle-chart';
import {post,get} from '../../axios/tools';
import config from '../../axios/config';

import fetchUnusual  from '../../action/unusual';

import './css/index.less'
const {RangePicker} = DatePicker;
const FormItem = Form.Item;
const confirm = Modal.confirm;

class EventUnusal extends Component{
    constructor(){
        super();
        this.state={
            addModalVisible:false,
            case_type:'',
            manu:0,//圈选异常
            system:0,//系统异常
            formValue:{},
        }
        this.inputData = {
            start_time: null,      //开始时间
            end_time: null,         //结束时间
        };
    }
    componentDidMount(){
        this.props.fetchUnusual(this.inputData) 
        this.getQueryAbnormalCaseNum()  
    }
    handleButton(item){
        this.setState({addModalVisible:true,formValue:item})
    }
    getQueryAbnormalCaseNum(){
        post({url:config.BASEURL+'queryAbnormalCaseNum',data:{}}).then((res)=>{
           if(res&&res.status === '200'){
                this.setState({
                    manu:res.result.manu,//圈选异常
                    system:res.result.system,//系统异常
                })
            }
        })
    }
    handleRangePickerChange(moment, date) {
        this.inputData.start_time = date[0];
        this.inputData.end_time = date[1];
    }
    handleButtonClick(){
        let param = this.inputData;
        param.case_type = this.state.case_type
        this.props.fetchUnusual(param)  
    }
    //关闭添加弹窗Modal
    hideAddModal(){
        this.setState({addModalVisible:false})
    }
    queryTable(type){
        let param = this.inputData;  
        param.case_type = type
        this.props.fetchUnusual(param)
    }
    //删除数据
    handleDelete(item){
        let _this = this;
        confirm({
            title: '您想好了，确定删除它?',
            // content: '删除此条配置',
            okText: '想好了',
            okType: 'danger',
            cancelText: '再想想',
            onOk() {
              post({url:config.BASEURL+'deleteAbnormalCase',data:item}).then((data)=>{
                if(data.status !== '200'){
                    message.error('删除失败');
                    return; 
                }
                _this.props.fetchUnusual(_this.inputData)
                message.success('删除成功');
            })
          },
          onCancel() {
              console.log('Cancel');
          },
      });   
    }
    render(){
       const { UnusalData=[],totalCount=0} = this.props.FetchUnusualList;
       const { manu ,system } = this.state
        const columns = [
            {title: '异常事件id', dataIndex: 'id', key: 'id',fixed: 'left', width: 80 },
            {title: '异常事件名称', dataIndex: 'event_name', key: 'event_name', width: 70},
            {title: '传感器id', dataIndex: 'sensor_id', key: 'sensor_id', width: 100},
            {title: '传感器名称', dataIndex: 'sensor_name', key: 'sensor_name', width: 70},
            {title: '设备名称', dataIndex: 'dev_name', key: 'dev_name', width: 100},
            {title: '功能名称', dataIndex: 'function_name', key: 'function_name', width: 100},
            {title: '趋势', dataIndex: 'trend_flg', key: 'trend_flg', width: 100},
            {title: '均值', dataIndex: 'mean_val', key: 'mean_val', width: 100},
            {title: '方差', dataIndex: 'mse_val', key: 'mse_val', width: 70},
            {title: '开始时间', dataIndex: 'start_time', key: 'start_time', width:160},
            {title: '持续时间', dataIndex: 'continue_time', key: 'continue_time' ,width: 160},
            {title: '结束时间', dataIndex: 'end_time', key: 'end_time', width: 160},
            {title: '创建时间', dataIndex: 'create_time', key: 'create_time' ,width: 160},
            {title: '操作人', dataIndex: 'operator', key: 'operator', width: 70},
            {title: '是否系统监控', dataIndex: 'to_sys_monitor', key: 'to_sys_monitor', width: 160},
            {title: '操作', dataIndex: 'operation', key: 'operation', fixed: 'right',align:'center'},
        ];
        console.log(222)
        let data = UnusalData&&UnusalData.map((item,index)=>{
            return {
                key: index,
                id: item.id,
                event_name: item.event_name,
                sensor_id: item.sensor_id,
                sensor_name:item.sensor_name,
                dev_name: item.dev_name,
                function_name: item.function_name,
                trend_flg: item.trend_flg,
                mean_val: item.mean_val,
                mse_val: item.mse_val,
                start_time:item.start_time,
                end_time: item.end_time,
                create_time:item.create_time,
                continue_time:item.continue_time,
                operator:item.operator,
                to_sys_monitor:item.to_sys_monitor,
                operation:<div><Button onClick={this.handleButton.bind(this,item)}>分析</Button><Button onClick={this.handleDelete.bind(this,item)}>删除</Button></div>
            }
        });
        //翻页器配置
        /*let pagination = {
            // size:"small",
            pageSize: pageSize,
            defaultCurrent: 1,
            total: total,
            onChange: (page) => {
                alert(page)
            }
        };*/
        return(
            <div className="EventUnusal">
                <BreadcrumbCustom first="事件诊断" second="异常事件"/>
                <div className='btnGroup'>
                    <Button type="primary" onClick={this.queryTable.bind(this,'manu')} style={{marginRight:20}}>圈选异常事件({manu})</Button>
                    <Button type="primary" onClick={this.queryTable.bind(this,'system')} >系统异常事件({system})</Button>
                </div>
                <Form style={{marginBottom:20}}>
                    <Row>
                        <Col>
                            <span style={{paddingRight:10}}>发生时间：</span>
                            <RangePicker format="YYYY-MM-DD HH:mm:ss" placeholder={['开始时间', '结束时间']} onChange={this.handleRangePickerChange.bind(this)} style={{paddingRight:10}}/>
                            <Button type="primary" icon="search" onClick={this.handleButtonClick.bind(this)}>搜索</Button>
                        </Col>
                    </Row>
                </Form>
                <div style={{"marginBottom":10}}>总共<span style={{"color":'red'}}>{totalCount}</span>条：</div>
                <Table columns={columns} dataSource={data} scroll={{ x: 1800, y:300}} />

                <Modal
                title="异常事件分析"
                width='600px'
                visible={this.state.addModalVisible}
                onOk={this.hideAddModal.bind(this)}
                onCancel={this.hideAddModal.bind(this)}
                okText="添加"
                cancelText="取消"
                footer={null}
                >
                    <WrappedAddModalForm formValue={this.state.formValue} hideModal={this.hideAddModal.bind(this)} />
                </Modal>

            </div>
        )
    }
}


//要state什么属性放到props里面
const mapStateToProps = (state) => {
    
    return state;
};
//要什么方法，放到props里面,自动dispath
const mapDispatchToProps = (dispatch) => ({
    fetchUnusual: bindActionCreators(fetchUnusual, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(EventUnusal));