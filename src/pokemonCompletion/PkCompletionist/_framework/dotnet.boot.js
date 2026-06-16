export const config = /*json-start*/{
  "mainAssemblyName": "PkCompletionist.dll",
  "resources": {
    "hash": "sha256-vmzHw88D8avUdHGhGiVRIwfxbo2aIbug9LgF2yuB9m0=",
    "jsModuleNative": [
      {
        "name": "dotnet.native.js"
      }
    ],
    "jsModuleRuntime": [
      {
        "name": "dotnet.runtime.js"
      }
    ],
    "wasmNative": [
      {
        "name": "dotnet.native.wasm",
        "hash": "sha256-p7pafOG40+CudanuKR5IfjzEDmvTQPK/Sf5PxRbVxoo="
      }
    ],
    "coreAssembly": [
      {
        "virtualPath": "System.Private.CoreLib.wasm",
        "name": "System.Private.CoreLib.wasm",
        "hash": "sha256-KtNv7uaQPIpP1aNjSFuzErVbrqhLZOIXDRq2Ih5PxXY="
      },
      {
        "virtualPath": "System.Runtime.InteropServices.JavaScript.wasm",
        "name": "System.Runtime.InteropServices.JavaScript.wasm",
        "hash": "sha256-i/hd1vZ8NyEQn334MejX+mbFI9luhL8P3KkOP2yXjO8="
      }
    ],
    "assembly": [
      {
        "virtualPath": "PkCompletionist.wasm",
        "name": "PkCompletionist.wasm",
        "hash": "sha256-AQ7uDbnto42TFJR2Ps18CsrWYSDCLChvGoT6PbdbuvU="
      },
      {
        "virtualPath": "System.Collections.Concurrent.wasm",
        "name": "System.Collections.Concurrent.wasm",
        "hash": "sha256-Klgs4FMBfHQG9CNxa5RjUC5WFgwXvIiKJmjprrJw4pI="
      },
      {
        "virtualPath": "System.Collections.wasm",
        "name": "System.Collections.wasm",
        "hash": "sha256-TlxzbqvgVs2f5o0QOrPonbgwRKYioAzus9+0tvN3hcw="
      },
      {
        "virtualPath": "System.ComponentModel.Primitives.wasm",
        "name": "System.ComponentModel.Primitives.wasm",
        "hash": "sha256-bSn/eEC4iYWVf/EDG0vtWeZXFl3S1GQeplvqf+R+EwM="
      },
      {
        "virtualPath": "System.ComponentModel.TypeConverter.wasm",
        "name": "System.ComponentModel.TypeConverter.wasm",
        "hash": "sha256-eYJIvagS0QsguaSeQM2Ogoovub2MJtruv+NOchGKx1M="
      },
      {
        "virtualPath": "System.Console.wasm",
        "name": "System.Console.wasm",
        "hash": "sha256-g2Du7lhLLhkmq1568pY4w9GGAB/gxhGnTP51HR8pIdM="
      },
      {
        "virtualPath": "System.Diagnostics.TraceSource.wasm",
        "name": "System.Diagnostics.TraceSource.wasm",
        "hash": "sha256-kIq4M2QSNE06u+r95URG7zSITvsG6R5TiH56zvQg8AA="
      },
      {
        "virtualPath": "System.Linq.wasm",
        "name": "System.Linq.wasm",
        "hash": "sha256-KnwsCrQhwG4BN7wemlHjuk5MOnpZSkHEsdkHYBRRyBA="
      },
      {
        "virtualPath": "System.ObjectModel.wasm",
        "name": "System.ObjectModel.wasm",
        "hash": "sha256-L4mFdjB1W/3Fim65A4O5PMOCD+IR2BmfyQdJK4XKShc="
      },
      {
        "virtualPath": "System.Runtime.Numerics.wasm",
        "name": "System.Runtime.Numerics.wasm",
        "hash": "sha256-20bWP+jWmtsDm/aDhI9AZjkJjRFFU5OH+X/2suMsqcY="
      },
      {
        "virtualPath": "System.Security.Cryptography.wasm",
        "name": "System.Security.Cryptography.wasm",
        "hash": "sha256-pWW4u/k95XasQQZ8FP4iKmKgOf2r6yaEDOawXPTB4Wk="
      },
      {
        "virtualPath": "System.Text.RegularExpressions.wasm",
        "name": "System.Text.RegularExpressions.wasm",
        "hash": "sha256-yyMONze9oMBjZTMz1nPSt918IfTkpGb9RQmeV4NHYKE="
      }
    ]
  },
  "debugLevel": 0,
  "globalizationMode": "invariant",
  "runtimeConfig": {
    "runtimeOptions": {
      "configProperties": {
        "Microsoft.Extensions.DependencyInjection.VerifyOpenGenericServiceTrimmability": true,
        "System.ComponentModel.DefaultValueAttribute.IsSupported": false,
        "System.ComponentModel.Design.IDesignerHost.IsSupported": false,
        "System.ComponentModel.TypeConverter.EnableUnsafeBinaryFormatterInDesigntimeLicenseContextSerialization": false,
        "System.ComponentModel.TypeDescriptor.IsComObjectDescriptorSupported": false,
        "System.Data.DataSet.XmlSerializationIsSupported": false,
        "System.Diagnostics.Debugger.IsSupported": false,
        "System.Diagnostics.Metrics.Meter.IsSupported": false,
        "System.Diagnostics.Tracing.EventSource.IsSupported": false,
        "System.Globalization.Invariant": true,
        "System.TimeZoneInfo.Invariant": false,
        "System.Globalization.PredefinedCulturesOnly": true,
        "System.Linq.Enumerable.IsSizeOptimized": true,
        "System.Net.Http.EnableActivityPropagation": false,
        "System.Net.Http.WasmEnableStreamingResponse": true,
        "System.Net.SocketsHttpHandler.Http3Support": false,
        "System.Reflection.Metadata.MetadataUpdater.IsSupported": false,
        "System.Resources.ResourceManager.AllowCustomResourceTypes": false,
        "System.Resources.UseSystemResourceKeys": true,
        "System.Runtime.CompilerServices.RuntimeFeature.IsDynamicCodeSupported": true,
        "System.Runtime.InteropServices.BuiltInComInterop.IsSupported": false,
        "System.Runtime.InteropServices.EnableConsumingManagedCodeFromNativeHosting": false,
        "System.Runtime.InteropServices.EnableCppCLIHostActivation": false,
        "System.Runtime.InteropServices.Marshalling.EnableGeneratedComInterfaceComImportInterop": false,
        "System.Runtime.Serialization.EnableUnsafeBinaryFormatterSerialization": false,
        "System.StartupHookProvider.IsSupported": false,
        "System.Text.Encoding.EnableUnsafeUTF7Encoding": false,
        "System.Text.Json.JsonSerializer.IsReflectionEnabledByDefault": false,
        "System.Threading.Thread.EnableAutoreleasePool": false
      }
    }
  }
}/*json-end*/;