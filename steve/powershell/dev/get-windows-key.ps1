﻿CLS

function Get-WindowsKey
{
    param ($targets = ".")

    $hklm = 2147483650

    $regPath = "Software\Microsoft\Windows NT\CurrentVersion"

    $regValue = "DigitalProductId"

    foreach ($target in $targets)
    {
        $productKey = $null
        $win32os    = $null
        $wmi        = [WMIClass]"\\$target\root\default:stdRegProv"
        $data       = $wmi.GetBinaryValue($hklm,$regPath,$regValue)
        $binArray   = ($data.uValue)[52..66]
        $charsArray = "B","C","D","F","G","H","J","K","M","P","Q","R","T","V","W","X","Y","2","3","4","6","7","8","9"

        ## decrypt base24 encoded binary data
        for ($i = 24; $i -ge 0; $i--)
        {
            $k = 0

            for ($j = 14; $j -ge 0; $j--)
            {
                $k = $k * 256 -bxor $binArray[$j]
                $binArray[$j] = [math]::truncate($k / 24)
                $k = $k % 24
            }

            $productKey = $charsArray[$k] + $productKey

            if (($i % 5 -eq 0) -and ($i -ne 0))
            {
                $productKey = "-" + $productKey
            }
        }

        $win32os = Get-WmiObject Win32_OperatingSystem -computer $target

        $obj = New-Object Object

        $obj | Add-Member Noteproperty Computer     -value $win32os.PSComputerName
        $obj | Add-Member Noteproperty Caption      -value $win32os.Caption
        $obj | Add-Member Noteproperty Architecture -value $win32os.OSArchitecture
        $obj | Add-Member Noteproperty BuildNumber  -value $win32os.BuildNumber
        $obj | Add-Member Noteproperty RegisteredTo -value $win32os.RegisteredUser
        $obj | Add-Member Noteproperty ProductID    -value $win32os.SerialNumber
        $obj | Add-Member Noteproperty ProductKey   -value $productkey

        $obj | Add-Member Noteproperty ProductKey   -value $win32os.ConvertToDateTime($win32os.InstallDate)
        
       

        $obj
    }
}

Get-WindowsKey