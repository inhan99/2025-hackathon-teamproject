import React from "react";
import ReactApexChart from "react-apexcharts";

// ApexCharts 컴포넌트
export const ChartComponent = ({
  chartData,
  onChartClick,
  getProductInfo,
  productCache,
}) => {
  const options = {
    chart: {
      type: chartData.chartType || "bar",
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false,
        },
      },
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
      },
      events: {
        dataPointSelection: function (event, chartContext, config) {
          if (
            onChartClick &&
            chartData.productIds &&
            chartData.productIds.length > 0
          ) {
            const dataPointIndex = config.dataPointIndex;
            onChartClick(chartData, dataPointIndex);
          }
        },
        click: function (event, chartContext, config) {
          if (
            onChartClick &&
            chartData.productIds &&
            chartData.productIds.length > 0
          ) {
            const dataPointIndex = config.dataPointIndex;
            onChartClick(chartData, dataPointIndex);
          }
        },
      },
    },
    title: {
      text: chartData.title || "데이터 분석 결과",
      align: "center",
      style: {
        fontSize: "16px",
        fontWeight: "bold",
      },
    },
    xaxis: {
      categories: chartData.categories || [],
      title: {
        text: chartData.xAxisTitle || "",
        style: {
          fontSize: "14px",
          fontWeight: "bold",
        },
      },
      labels: {
        style: {
          fontSize: "11px",
          color: "#6B7280",
        },
        rotate: -45,
        rotateAlways: false,
        maxHeight: 60,
        trim: false,
        wrap: true,
        wrapFormatter: function (val, opts) {
          // 긴 텍스트를 10자마다 줄바꿈
          if (val.length > 10) {
            return val.match(/.{1,10}/g).join("\n");
          }
          return val;
        },
      },
    },
    yaxis: {
      title: {
        text: chartData.yAxisTitle || "",
        style: {
          fontSize: "14px",
          fontWeight: "bold",
        },
      },
    },
    colors: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"],
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false,
      },
    },
    states: {
      hover: {
        filter: {
          type: "darken",
          value: 0.1,
        },
      },
      active: {
        filter: {
          type: "darken",
          value: 0.35,
        },
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 300,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
    tooltip: {
      enabled: true,
      theme: "light",
      style: {
        fontSize: "14px",
      },
      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
        console.log("툴팁 호출됨:", { series, seriesIndex, dataPointIndex });
        console.log("차트 데이터:", chartData);

        const category = w.globals.labels[dataPointIndex];
        const value = series[seriesIndex][dataPointIndex];
        const productId =
          chartData.productIds && chartData.productIds[dataPointIndex];
        const hasProduct = productId && productId > 0;

        console.log("툴팁 정보:", {
          category,
          value,
          hasProduct,
          productId,
          productIds: chartData.productIds,
        });

        // 상품 정보가 있으면 상세 툴팁 표시
        if (hasProduct && productCache && productCache[productId]) {
          const productInfo = productCache[productId];
          console.log("ChartComponent - 상품 정보:", productInfo);
          console.log("ChartComponent - 상품 이미지:", productInfo.images);

          const thumbnailUrl =
            productInfo.images && productInfo.images.length > 0
              ? `http://localhost:8080${productInfo.images[0].url}`
              : null;

          console.log("ChartComponent - 썸네일 URL:", thumbnailUrl);

          return `
            <div class="custom-tooltip" style="padding: 12px; background: white; border: 1px solid #ccc; border-radius: 8px; max-width: 300px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="display: flex; gap: 12px; align-items: start;">
                ${
                  thumbnailUrl
                    ? `
                  <div style="flex-shrink: 0;">
                    <img src="${thumbnailUrl}" alt="${productInfo.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; border: 1px solid #eee;">
                  </div>
                `
                    : ""
                }
                <div style="flex: 1; min-width: 0;">
                  <div style="font-weight: bold; margin-bottom: 4px; color: #1f2937; font-size: 14px; line-height: 1.3;">${
                    productInfo.name
                  }</div>
                  <div style="margin-bottom: 4px; color: #059669; font-weight: bold; font-size: 14px;">₩${
                    productInfo.basePrice?.toLocaleString() || "N/A"
                  }</div>
                  ${
                    productInfo.rating
                      ? `
                    <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
                      <span style="color: #f59e0b;">★</span>
                      <span style="color: #6b7280; font-size: 12px;">${productInfo.rating.toFixed(
                        1
                      )}</span>
                    </div>
                  `
                      : ""
                  }
                  <div style="color: #3b82f6; font-size: 11px; font-weight: 500;">클릭하여 상품 상세보기</div>
                </div>
              </div>
            </div>
          `;
        }

        // 기본 툴팁
        return `
          <div class="custom-tooltip" style="padding: 8px; background: white; border: 1px solid #ccc; border-radius: 4px;">
            <div style="font-weight: bold; margin-bottom: 4px;">${category}</div>
            <div style="margin-bottom: 4px;">값: ${value}</div>
            ${
              hasProduct
                ? '<div style="color: #3B82F6; font-size: 12px;">클릭하여 상품 상세보기</div>'
                : ""
            }
          </div>
        `;
      },
    },
  };

  const series = chartData.series || [];

  return (
    <div
      className="chart-container"
      style={{ width: "100%", maxWidth: "350px", margin: "0 auto" }}
    >
      <ReactApexChart
        options={options}
        series={series}
        type={chartData.chartType || "bar"}
        height={350}
      />
    </div>
  );
};

// ApexCharts 컴포넌트 (전체화면)
export const FullScreenChartComponent = ({
  chartData,
  onChartClick,
  getProductInfo,
  productCache,
}) => {
  const options = {
    chart: {
      type: chartData.chartType || "bar",
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
      },
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
      },
      events: {
        dataPointSelection: function (event, chartContext, config) {
          if (
            onChartClick &&
            chartData.productIds &&
            chartData.productIds.length > 0
          ) {
            const dataPointIndex = config.dataPointIndex;
            onChartClick(chartData, dataPointIndex);
          }
        },
        click: function (event, chartContext, config) {
          if (
            onChartClick &&
            chartData.productIds &&
            chartData.productIds.length > 0
          ) {
            const dataPointIndex = config.dataPointIndex;
            onChartClick(chartData, dataPointIndex);
          }
        },
      },
    },
    title: {
      text: chartData.title || "데이터 분석 결과",
      align: "center",
      style: {
        fontSize: "28px",
        fontWeight: "bold",
        color: "#1F2937",
      },
    },
    subtitle: {
      text: `${chartData.categories?.length || 0}개 데이터`,
      align: "center",
      style: {
        fontSize: "16px",
        color: "#6B7280",
      },
    },
    xaxis: {
      categories: chartData.categories || [],
      title: {
        text: chartData.xAxisTitle || "",
        style: {
          fontSize: "18px",
          fontWeight: "bold",
          color: "#374151",
        },
      },
      labels: {
        style: {
          fontSize: "14px",
          color: "#6B7280",
        },
        rotate: -45,
        rotateAlways: false,
        maxHeight: 80,
        trim: false,
        wrap: true,
        wrapFormatter: function (val, opts) {
          // 긴 텍스트를 15자마다 줄바꿈 (전체화면에서는 더 긴 텍스트 허용)
          if (val.length > 15) {
            return val.match(/.{1,15}/g).join("\n");
          }
          return val;
        },
      },
    },
    yaxis: {
      title: {
        text: chartData.yAxisTitle || "",
        style: {
          fontSize: "18px",
          fontWeight: "bold",
          color: "#374151",
        },
      },
      labels: {
        style: {
          fontSize: "14px",
          color: "#6B7280",
        },
      },
    },
    colors: [
      "#3B82F6",
      "#10B981",
      "#F59E0B",
      "#EF4444",
      "#8B5CF6",
      "#06B6D4",
      "#84CC16",
      "#F97316",
    ],
    dataLabels: {
      enabled: true,
      style: {
        fontSize: "14px",
        fontWeight: "bold",
        colors: ["#1F2937"],
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        horizontal: false,
        columnWidth: "70%",
        distributed: false,
      },
      pie: {
        donut: {
          size: "60%",
        },
      },
    },
    states: {
      hover: {
        filter: {
          type: "darken",
          value: 0.1,
        },
      },
      active: {
        filter: {
          type: "darken",
          value: 0.35,
        },
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "center",
      fontSize: "16px",
      fontWeight: "bold",
    },
    grid: {
      borderColor: "#E5E7EB",
      strokeDashArray: 4,
    },
    tooltip: {
      enabled: true,
      theme: "light",
      style: {
        fontSize: "14px",
      },
      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
        console.log("전체화면 툴팁 호출됨:", {
          series,
          seriesIndex,
          dataPointIndex,
        });

        const category = w.globals.labels[dataPointIndex];
        const value = series[seriesIndex][dataPointIndex];
        const productId =
          chartData.productIds && chartData.productIds[dataPointIndex];
        const hasProduct = productId && productId > 0;

        console.log("전체화면 툴팁 정보:", {
          category,
          value,
          hasProduct,
          productId,
          productIds: chartData.productIds,
        });

        // 상품 정보가 있으면 상세 툴팁 표시
        if (hasProduct && productCache && productCache[productId]) {
          const productInfo = productCache[productId];
          const thumbnailUrl =
            productInfo.images && productInfo.images.length > 0
              ? `http://localhost:8080${productInfo.images[0].url}`
              : null;

          return `
            <div class="custom-tooltip" style="padding: 16px; background: white; border: 1px solid #ccc; border-radius: 12px; max-width: 400px; box-shadow: 0 8px 16px rgba(0,0,0,0.15);">
              <div style="display: flex; gap: 16px; align-items: start;">
                ${
                  thumbnailUrl
                    ? `
                  <div style="flex-shrink: 0;">
                    <img src="${thumbnailUrl}" alt="${productInfo.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid #eee;">
                  </div>
                `
                    : ""
                }
                <div style="flex: 1; min-width: 0;">
                  <div style="font-weight: bold; margin-bottom: 6px; color: #1f2937; font-size: 16px; line-height: 1.3;">${
                    productInfo.name
                  }</div>
                  <div style="margin-bottom: 6px; color: #059669; font-weight: bold; font-size: 16px;">₩${
                    productInfo.basePrice?.toLocaleString() || "N/A"
                  }</div>
                  ${
                    productInfo.rating
                      ? `
                    <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
                      <span style="color: #f59e0b; font-size: 16px;">★</span>
                      <span style="color: #6b7280; font-size: 14px;">${productInfo.rating.toFixed(
                        1
                      )}</span>
                    </div>
                  `
                      : ""
                  }
                  <div style="color: #3b82f6; font-size: 12px; font-weight: 500;">클릭하여 상품 상세보기</div>
                </div>
              </div>
            </div>
          `;
        }

        // 기본 툴팁
        return `
          <div class="custom-tooltip" style="padding: 12px; background: white; border: 1px solid #ccc; border-radius: 8px;">
            <div style="font-weight: bold; margin-bottom: 6px; font-size: 16px;">${category}</div>
            <div style="margin-bottom: 6px; font-size: 14px;">값: ${value}</div>
            ${
              hasProduct
                ? '<div style="color: #3B82F6; font-size: 14px;">클릭하여 상품 상세보기</div>'
                : ""
            }
          </div>
        `;
      },
    },
  };

  const series = chartData.series || [];

  return (
    <div
      className="fullscreen-chart-container"
      style={{ width: "100%", height: "100%" }}
    >
      <ReactApexChart
        options={options}
        series={series}
        type={chartData.chartType || "bar"}
        height="100%"
      />
    </div>
  );
};
