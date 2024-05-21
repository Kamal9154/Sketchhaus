import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EChartOption } from 'echarts';
import { ToastrService } from 'ngx-toastr';

import { echartStyles } from 'src/app/shared/echart-styles';
import { ApiUrlService } from 'src/app/shared/services/api-url.service';
import { HttpService } from 'src/app/shared/services/http-service';


@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
    chartLineOption1: EChartOption;
    chartLineOption2: EChartOption;
    chartLineOption3: EChartOption;
    salesChartPie: EChartOption;

    salesChartBar: EChartOption;
    initialChartBar: EChartOption;
    inprogressChartBar: EChartOption;
    deliveredChartBar: EChartOption;
    id = localStorage.getItem('user_id')
    totaldata;
    totaluser;
    userchart;
    initialuserchart;
    inprogressuserchart;
    delivereduserchart;
    totalinitialuserchart;
    totalinprogressuserchart;
    totaldelivereduserchart;

    constructor(private http: HttpService, private url: ApiUrlService, private router: Router, private toastr: ToastrService) {
    }
    // test branche staging
    async ngOnInit() {


        let total = await this.http.post(this.url.url.dashboardTotalcounts, { id: this.id })
        this.totaldata = total['data']
        if (total['message'] == 'Wrong authorization' || total['message'] == 'Session is expired please login again') {
            localStorage.clear()
            this.router.navigateByUrl("/sessions/signin")
            this.toastr.error(total['message'])
        }

        this.userChart('2023')
        this.initialUserChart('2023')
        this.inprogressUserChart('2023')
        this.deliveredUserChart('2023')

    }
    async userChart(year?: any) {
        let userchart = await this.http.post(this.url.url.userchart, { id: this.id, year: year })
        this.userchart = userchart['data']
        this.totaluser = userchart['totalcount']
        let maxValue = 0
        let maxBarCount = 0
        this.userchart.forEach(element => {
            if (element.count > maxValue) maxValue = element.count
            if(element.count > 0) maxBarCount += 1
        });
       /* make max value even */
       if(maxValue%2){maxValue += 1}
        this.salesChartBar = {
            // legend: {
            //     borderRadius: 0,
            //     orient: 'horizontal',
            //     x: 'left',
            //     data: ['User']
            // },
            grid: {
                left: '8px',
                right: '8px',
                bottom: '0',
                containLabel: true
            },
            tooltip: {
                show: true,
                backgroundColor: 'rgba(0, 0, 0, .8)'
            },
            xAxis: [{
                type: 'category',
                data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
                axisTick: {
                    alignWithLabel: true
                },
                splitLine: {
                    show: false
                },
                axisLine: {
                    show: true
                }
            }],
            yAxis: [{
                type: 'value',
                axisLabel: {
                    formatter: '{value}'
                },
                min: 0,
                max: maxValue,
                interval: Math.round(maxValue / maxBarCount) == 0 ? 1 : Math.round(maxValue / maxBarCount),
                axisLine: {
                    show: false
                },
                splitLine: {
                    show: true,
                    interval: 'auto'
                }
            }

            ],

            series: [
                {
                    name: 'User',
                    data: [this.userchart['0']['count'], this.userchart['1']['count'], this.userchart['2']['count'], this.userchart['3']['count'], this.userchart['4']['count'], this.userchart['5']['count'], this.userchart['6']['count'], this.userchart['7']['count'], this.userchart['8']['count'], this.userchart['9']['count'], this.userchart['10']['count'], this.userchart['11']['count']],
                    label: { show: false, color: '#639' },
                    type: 'bar',
                    color: '#21ba72',
                    smooth: true
                }

            ]
        };
    }
    async initialUserChart(year?: any) {
        let initialuserchart = await this.http.post(this.url.url.initialuserchart, { id: this.id, year: year })
        this.initialuserchart = initialuserchart['data']
        this.totalinitialuserchart = initialuserchart['totalcount']
        let maxValue = 0
        let maxBarCount = 0
        this.initialuserchart.forEach(element => {
            if (element.count > maxValue) maxValue = element.count
            if(element.count > 0) maxBarCount += 1
        });
       /* make max value even */
       if(maxValue%2){maxValue += 1}
        this.initialChartBar = {
            // legend: {
            //     borderRadius: 0,
            //     orient: 'horizontal',
            //     x: 'right',
            //     data: ['Initial']
            // },
            grid: {
                left: '8px',
                right: '8px',
                bottom: '0',
                containLabel: true
            },
            tooltip: {
                show: true,
                backgroundColor: 'rgba(0, 0, 0, .8)'
            },
            xAxis: [{
                type: 'category',
                data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
                axisTick: {
                    alignWithLabel: true
                },
                splitLine: {
                    show: false
                },
                axisLine: {
                    show: true
                }
            }],
            yAxis: [{
                type: 'value',
                axisLabel: {
                    formatter: '{value}'
                },
                min: 0,
                max: maxValue,
                interval: Math.round(maxValue / maxBarCount) == 0 ? 1 : Math.round(maxValue / maxBarCount),
                axisLine: {
                    show: false
                },
                splitLine: {
                    show: true,
                    interval: 'auto'
                }
            }

            ],

            series: [
                {
                    name: 'Initial',
                    data: [this.initialuserchart['0']['count'], this.initialuserchart['1']['count'], this.initialuserchart['2']['count'], this.initialuserchart['3']['count'], this.initialuserchart['4']['count'], this.initialuserchart['5']['count'], this.initialuserchart['6']['count'], this.initialuserchart['7']['count'], this.initialuserchart['8']['count'], this.initialuserchart['9']['count'], this.initialuserchart['10']['count'], this.initialuserchart['11']['count']],
                    label: { show: false, color: '#639' },
                    type: 'bar',
                    color: '#e54122',
                    smooth: true
                }

            ]
        };
    }
    async inprogressUserChart(year?: any) {
        let inprogressuserchart = await this.http.post(this.url.url.inprogressuserchart, { id: this.id, year: year })
        this.inprogressuserchart = inprogressuserchart['data']
        this.totalinprogressuserchart = inprogressuserchart['totalcount']
        console.log(this.totalinprogressuserchart)
        let maxValue = 0
        let maxBarCount = 0
        this.inprogressuserchart.forEach(element => {
            if (element.count > maxValue) maxValue = element.count
            if(element.count > 0) maxBarCount += 1
        });
        /* make max value even */
        if(maxValue%2){maxValue += 1}        
        this.inprogressChartBar = {
            // legend: {
            //     borderRadius: 0,
            //     orient: 'horizontal',
            //     x: 'right',
            //     data: ['Inprogress']
            // },
            grid: {
                left: '8px',
                right: '8px',
                bottom: '0',
                containLabel: true
            },
            tooltip: {
                show: true,
                backgroundColor: 'rgba(0, 0, 0, .8)'
            },
            xAxis: [{
                type: 'category',
                data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
                axisTick: {
                    alignWithLabel: true
                },
                splitLine: {
                    show: false
                },
                axisLine: {
                    show: true
                }
            }],
            yAxis: [{
                type: 'value',
                axisLabel: {
                    formatter: '{value}'
                },
                min: 0,
                max: maxValue,
                interval: Math.round(maxValue / maxBarCount) == 0 ? 1 : Math.round(maxValue / maxBarCount),
                axisLine: {
                    show: false
                },
                splitLine: {
                    show: true,
                    interval: 'auto'
                }
            }

            ],

            series: [
                {
                    name: 'Inprogress',
                    data: [this.inprogressuserchart['0']['count'], this.inprogressuserchart['1']['count'], this.inprogressuserchart['2']['count'], this.inprogressuserchart['3']['count'], this.inprogressuserchart['4']['count'], this.inprogressuserchart['5']['count'], this.inprogressuserchart['6']['count'], this.inprogressuserchart['7']['count'], this.inprogressuserchart['8']['count'], this.inprogressuserchart['9']['count'], this.inprogressuserchart['10']['count'], this.inprogressuserchart['11']['count']],
                    label: { show: false, color: '#639' },
                    type: 'bar',
                    color: '#1d73ea',
                    smooth: true
                }

            ]

        };
    }
    async deliveredUserChart(year?: any) {
        let delivereduserchart = await this.http.post(this.url.url.delivereduserchart, { id: this.id, year: year })
        this.delivereduserchart = delivereduserchart['data']
        this.totaldelivereduserchart = delivereduserchart['totalcount']
        let maxValue = 0
        let maxBarCount = 0
        this.delivereduserchart.forEach(element => {
            if (element.count > maxValue) maxValue = element.count
            if(element.count > 0) maxBarCount += 1
        });
        /* make max value even */
        if(maxValue%2){maxValue += 1}        
        this.deliveredChartBar = {
            // legend: {
            //     borderRadius: 0,
            //     orient: 'horizontal',
            //     x: 'right',
            //     data: ['Delivered']
            // },
            grid: {
                left: '8px',
                right: '8px',
                bottom: '0',
                containLabel: true
            },
            tooltip: {
                show: true,
                backgroundColor: 'rgba(0, 0, 0, .8)'
            },
            xAxis: [{
                type: 'category',
                data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
                axisTick: {
                    alignWithLabel: true
                },
                splitLine: {
                    show: false
                },
                axisLine: {
                    show: true
                }
            }],
            yAxis: [{
                type: 'value',
                axisLabel: {
                    formatter: '{value}'
                },
                min: 0,
                max: maxValue,
                interval:Math.round(maxValue / maxBarCount) == 0 ? 1 : Math.round(maxValue / maxBarCount),
                axisLine: {
                    show: false
                },
                splitLine: {
                    show: true,
                    interval: 'auto'
                }
            }

            ],

            series: [
                {
                    name: 'Delivered',
                    data: [this.delivereduserchart['0']['count'], this.delivereduserchart['1']['count'], this.delivereduserchart['2']['count'], this.delivereduserchart['3']['count'], this.delivereduserchart['4']['count'], this.delivereduserchart['5']['count'], this.delivereduserchart['6']['count'], this.delivereduserchart['7']['count'], this.delivereduserchart['8']['count'], this.delivereduserchart['9']['count'], this.delivereduserchart['10']['count'], this.delivereduserchart['11']['count']],
                    label: { show: false, color: '#639' },
                    type: 'bar',
                    color: '#7569b3',
                    smooth: true
                }

            ]
        };
    }
    onyearchangeUser(e: any) {

        this.userChart(e.target.value)
    }
    onyearchangeInitial(e: any) {

        this.initialUserChart(e.target.value)
    }
    onyearchangeInprogress(e: any) {

        this.inprogressUserChart(e.target.value)
    }
    onyearchangeDelivered(e: any) {

        this.deliveredUserChart(e.target.value)
    }

}
