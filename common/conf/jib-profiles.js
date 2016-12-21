/*
 * Copyright (c) 2015, 2016, Oracle and/or its affiliates. All rights reserved.
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER.
 *
 * This code is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License version 2 only, as
 * published by the Free Software Foundation.  Oracle designates this
 * particular file as subject to the "Classpath" exception as provided
 * by Oracle in the LICENSE file that accompanied this code.
 *
 * This code is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
 * version 2 for more details (a copy is included in the LICENSE file that
 * accompanied this code).
 *
 * You should have received a copy of the GNU General Public License version
 * 2 along with this work; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 * Please contact Oracle, 500 Oracle Parkway, Redwood Shores, CA 94065 USA
 * or visit www.oracle.com if you need additional information or have any
 * questions.
 */

/*
 * This file defines build profiles for the JIB tool and others.
 *
 * A build profile defines a set of configuration options and external
 * dependencies that we for some reason or other care about specifically.
 * Typically, build profiles are defined for the build configurations we
 * build regularly.
 *
 * Contract against this file from the tools that use it, is to provide
 * a function on the form:
 *
 * getJibProfiles(input)
 *
 * which returns an object graph describing the profiles and their
 * dependencies. The name of the function is based on the name of this
 * file, minus the extension and the '-', camel cased and prefixed with
 * 'get'.
 *
 *
 * The parameter 'input' is an object that optionally contains  some data.
 * Optionally because a tool may read the configuration for different purposes.
 * To initially get a list of available profiles, the active profile may not
 * yet be known for instance.
 *
 * Data that may be set on the input object:
 *
 * input.profile = <name of active profile>
 *
 * If the active profile is set, the following data from it must also
 * be provided:
 *
 * input.profile
 * input.build_id
 * input.target_os
 * input.target_cpu
 * input.build_os
 * input.build_cpu
 * input.target_platform
 * input.build_platform
 * // The build_osenv_* variables describe the unix layer on Windows systems,
 * // i.e. Cygwin, which may also be 32 or 64 bit.
 * input.build_osenv
 * input.build_osenv_cpu
 * input.build_osenv_platform
 *
 * For more complex nested attributes, there is a method "get":
 *
 * input.get("<dependency>", "<attribute>")
 *
 * Valid attributes are:
 * install_path
 * download_path
 * download_dir
 *
 *
 * The output data generated by this configuration file has the following
 * format:
 *
 * data: {
 *   // Identifies the version of this format to the tool reading it
 *   format_version: "1.0",
 *
 *   // Name of base outputdir. JIB assumes the actual output dir is formed
 *   // by adding the configuration name: <output_basedir>/<config-name>
 *   output_basedir: "build",
 *   // Configure argument to use to specify configuration name
 *   configuration_configure_arg:
 *   // Make argument to use to specify configuration name
 *   configuration_make_arg:
 *
 *   profiles: {
 *     <profile-name>: {
 *       // Name of os the profile is built to run on
 *       target_os; <string>
 *       // Name of cpu the profile is built to run on
 *       target_cpu; <string>
 *       // Combination of target_os and target_cpu for convenience
 *       target_platform; <string>
 *       // Name of os the profile is built on
 *       build_os; <string>
 *       // Name of cpu the profile is built on
 *       build_cpu; <string>
 *       // Combination of build_os and build_cpu for convenience
 *       build_platform; <string>
 *
 *       // List of dependencies needed to build this profile
 *       dependencies: <Array of strings>
 *
 *       // List of configure args to use for this profile
 *       configure_args: <Array of strings>
 *
 *       // List of free form labels describing aspects of this profile
 *       labels: <Array of strings>
 *     }
 *   }
 *
 *   // Dependencies use a Maven like deployment structure
 *   dependencies: {
 *     <dependency-name>: {
 *       // Organization part of path defining this dependency
 *       organization: <string>
 *       // File extension for this dependency
 *       ext: <string>
 *       // Module part of path for defining this dependency,
 *       // defaults to <dependency-name>
 *       module: <string>
 *       // Revision part of path for defining this dependency
 *       revision: <string>
 *
 *       // List of configure args to add when using this dependency,
 *       // defaults to
 *       // "--with-<dependency-name>=input.get("<dependency-name", "install_path")"
 *       configure_args: <array of strings>
 *
 *       // Name of environment variable to set when using this dependency
 *       // when running make
 *       environment_name: <string>
 *       // Value of environment variable to set when using this dependency
 *       // when running make
 *       environment_value: <string>
 *
 *       // Value to add to the PATH variable when using this dependency,
 *       // applies to both make and configure
 *       environment_path: <string>
 *     }
 *
 *     <dependency-name>: {
 *       // For certain dependencies where a legacy distribution mechanism is
 *       // already in place, the "javare" server layout is also supported
 *       // Indicate that an alternate server source and layout should be used
 *       server: "javare"
 *
 *       // For "javare", a combination of module, revision,
 *       // build number (optional), files and checksum file is possible for
 *       // artifacts following the standard layout.
 *       module: <string>
 *       revision: <string>
 *       build_number: <string>
 *       checksum_file: <string>
 *       file: <string>
 *
 *       // For other files, use checksum path and path instead
 *       checksum_path: <string>
 *       path: <string>
 *     }
 *   }
 * }
 */

/**
 * Main entry to generate the profile configuration
 *
 * @param input External data to use for generating the configuration
 * @returns {{}} Profile configuration
 */
var getJibProfiles = function (input) {

    var data = {};

    // Identifies the version of this format to the tool reading it.
    // 1.1 signifies that the publish, publish-src and get-src features are usable.
    data.format_version = "1.1";

    // Organization, product and version are used when uploading/publishing build results
    data.organization = "";
    data.product = "jdk";
    data.version = getVersion();

    // The base directory for the build output. JIB will assume that the
    // actual build directory will be <output_basedir>/<configuration>
    data.output_basedir = "build";
    // The configure argument to use to specify the name of the configuration
    data.configuration_configure_arg = "--with-conf-name=";
    // The make argument to use to specify the name of the configuration
    data.configuration_make_arg = "CONF_NAME=";

    // Exclude list to use when Jib creates a source bundle
    data.src_bundle_excludes = "./build webrev .hg */.hg */*/.hg */*/*/.hg";
    // Include list to use when creating a minimal jib source bundle which
    // contains just the jib configuration files.
    data.conf_bundle_includes = "*/conf/jib-profiles.* common/autoconf/version-numbers"

    // Define some common values
    var common = getJibProfilesCommon(input, data);
    // Generate the profiles part of the configuration
    data.profiles = getJibProfilesProfiles(input, common, data);
    // Generate the dependencies part of the configuration
    data.dependencies = getJibProfilesDependencies(input, common, data);

    return data;
};

/**
 * Generates some common values
 *
 * @param input External data to use for generating the configuration
 * @returns Common values
 */
var getJibProfilesCommon = function (input, data) {
    var common = {};

    common.organization = "jpg.infra.builddeps";
    common.build_id = getBuildId(input);
    common.build_number = input.build_number != null ? input.build_number : "0";

    // List of the main profile names used for iteration
    common.main_profile_names = [
        "linux-x64", "linux-x86", "macosx-x64", "solaris-x64",
        "solaris-sparcv9", "windows-x64", "windows-x86"
    ];

    // These are the base setttings for all the main build profiles.
    common.main_profile_base = {
        dependencies: ["boot_jdk", "gnumake", "jtreg"],
        default_make_targets: ["product-bundles", "test-bundles"],
        configure_args: [
            "--with-version-opt=" + common.build_id,
            "--enable-jtreg-failure-handler",
            "--with-version-build=" + common.build_number
        ]
    };
    // Extra settings for debug profiles
    common.debug_suffix = "-debug";
    common.debug_profile_base = {
        configure_args: ["--enable-debug"],
        labels: "debug"
    };
    // Extra settings for slowdebug profiles
    common.slowdebug_suffix = "-slowdebug";
    common.slowdebug_profile_base = {
        configure_args: ["--with-debug-level=slowdebug"],
        labels: "slowdebug"
    };
    // Extra settings for openjdk only profiles
    common.open_suffix = "-open";
    common.open_profile_base = {
        configure_args: ["--enable-openjdk-only"],
        labels: "open"
    };

    common.configure_args_32bit = ["--with-target-bits=32"];

    /**
     * Define common artifacts template for all main profiles
     * @param pf - Name of platform in bundle names
     * @param demo_ext - Type of extension for demo bundle
     */
    common.main_profile_artifacts = function (pf, demo_ext) {
        return {
            artifacts: {
                jdk: {
                    local: "bundles/\\(jdk.*bin.tar.gz\\)",
                    remote: [
                        "bundles/" + pf + "/jdk-" + data.version + "_" + pf + "_bin.tar.gz",
                        "bundles/" + pf + "/\\1"
                    ],
                    subdir: "jdk-" + data.version,
                    exploded: "images/jdk"
                },
                jre: {
                    local: "bundles/\\(jre.*bin.tar.gz\\)",
                    remote: [
                        "bundles/" + pf + "/jre-" + data.version + "_" + pf + "_bin.tar.gz",
                        "bundles/" + pf + "/\\1"
                    ],
                    subdir: "jre-" + data.version,
                    exploded: "images/jre"
                },
                test: {
                    local: "bundles/\\(jdk.*bin-tests.tar.gz\\)",
                    remote: [
                        "bundles/" + pf + "/jdk-" + data.version + "_" + pf + "_bin-tests.tar.gz",
                        "bundles/" + pf + "/\\1"
                    ],
                    exploded: "images/test"
                },
                jdk_symbols: {
                    local: "bundles/\\(jdk.*bin-symbols.tar.gz\\)",
                    remote: [
                        "bundles/" + pf + "/jdk-" + data.version + "_" + pf + "_bin-symbols.tar.gz",
                        "bundles/" + pf + "/\\1"
                    ],
                    subdir: "jdk-" + data.version,
                    exploded: "images/jdk"
                },
                jre_symbols: {
                    local: "bundles/\\(jre.*bin-symbols.tar.gz\\)",
                    remote: [
                        "bundles/" + pf + "/jre-" + data.version + "_" + pf + "_bin-symbols.tar.gz",
                        "bundles/" + pf + "/\\1"
                    ],
                    subdir: "jre-" + data.version,
                    exploded: "images/jre"
                },
                demo: {
                    local: "bundles/\\(jdk.*demo." + demo_ext + "\\)",
                    remote: [
                        "bundles/" + pf + "/jdk-" + data.version + "_" + pf + "_demo." + demo_ext,
                        "bundles/" + pf + "/\\1"
                    ],
                }
            }
        };
    };


    /**
     * Define common artifacts template for all debug profiles
     * @param pf - Name of platform in bundle names
     */
    common.debug_profile_artifacts = function (pf) {
        return {
            artifacts: {
                jdk: {
                    local: "bundles/\\(jdk.*bin-debug.tar.gz\\)",
                    remote: [
                        "bundles/" + pf + "/jdk-" + data.version + "_" + pf + "_bin-debug.tar.gz",
                        "bundles/" + pf + "/\\1"
                    ],
                    subdir: "jdk-" + data.version,
                    exploded: "images/jdk"
                },
                jre: {
                    local: "bundles/\\(jre.*bin-debug.tar.gz\\)",
                    remote: [
                        "bundles/" + pf + "/jre-" + data.version + "_" + pf + "_bin-debug.tar.gz",
                        "bundles/" + pf + "/\\1"
                    ],
                    subdir: "jre-" + data.version,
                    exploded: "images/jre"
                },
                test: {
                    local: "bundles/\\(jdk.*bin-tests-debug.tar.gz\\)",
                    remote: [
                        "bundles/" + pf + "/jdk-" + data.version + "_" + pf + "_bin-tests-debug.tar.gz",
                        "bundles/" + pf + "/\\1"
                    ],
                    exploded: "images/test"
                },
                jdk_symbols: {
                    local: "bundles/\\(jdk.*bin-debug-symbols.tar.gz\\)",
                    remote: [
                        "bundles/" + pf + "/jdk-" + data.version + "_" + pf + "_bin-debug-symbols.tar.gz",
                        "bundles/" + pf + "/\\1"
                    ],
                    subdir: "jdk-" + data.version,
                    exploded: "images/jdk"
                },
                jre_symbols: {
                    local: "bundles/\\(jre.*bin-debug-symbols.tar.gz\\)",
                    remote: [
                        "bundles/" + pf + "/jre-" + data.version + "_" + pf + "_bin-debug-symbols.tar.gz",
                        "bundles/" + pf + "/\\1"
                    ],
                    subdir: "jre-" + data.version,
                    exploded: "images/jre"
                }
            }
        };
    };

    var boot_jdk_revision = "8";
    var boot_jdk_subdirpart = "1.8.0";
    // JDK 8 does not work on sparc M7 cpus, need a newer update when building
    // on such hardware.
    if (input.build_cpu == "sparcv9") {
       var cpu_brand = $EXEC("bash -c \"kstat -m cpu_info | grep brand | head -n1 | awk '{ print \$2 }'\"");
       if (cpu_brand.trim() == 'SPARC-M7') {
           boot_jdk_revision = "8u20";
           boot_jdk_subdirpart = "1.8.0_20";
       }
    }
    common.boot_jdk_revision = boot_jdk_revision;
    common.boot_jdk_subdirpart = boot_jdk_subdirpart;
    common.boot_jdk_home = input.get("boot_jdk", "home_path") + "/jdk"
        + common.boot_jdk_subdirpart
        + (input.build_os == "macosx" ? ".jdk/Contents/Home" : "");

    return common;
};

/**
 * Generates the profiles part of the configuration.
 *
 * @param input External data to use for generating the configuration
 * @param common The common values
 * @returns {{}} Profiles part of the configuration
 */
var getJibProfilesProfiles = function (input, common, data) {
    // Main SE profiles
    var profiles = {

        "linux-x64": {
            target_os: "linux",
            target_cpu: "x64",
            dependencies: ["devkit"],
            configure_args: ["--with-zlib=system"],
            default_make_targets: ["docs-bundles"],
        },

        "linux-x86": {
            target_os: "linux",
            target_cpu: "x86",
            build_cpu: "x64",
            dependencies: ["devkit"],
            configure_args: concat(common.configure_args_32bit,
                "--with-jvm-variants=minimal,server", "--with-zlib=system"),
        },

        "macosx-x64": {
            target_os: "macosx",
            target_cpu: "x64",
            dependencies: ["devkit"],
            configure_args: concat(common.configure_args, "--with-zlib=system"),
        },

        "solaris-x64": {
            target_os: "solaris",
            target_cpu: "x64",
            dependencies: ["devkit", "cups"],
            configure_args: ["--with-zlib=system", "--enable-dtrace"],
        },

        "solaris-sparcv9": {
            target_os: "solaris",
            target_cpu: "sparcv9",
            dependencies: ["devkit", "cups"],
            configure_args: ["--with-zlib=system", "--enable-dtrace"],
        },

        "windows-x64": {
            target_os: "windows",
            target_cpu: "x64",
            dependencies: ["devkit", "freetype"],
        },

        "windows-x86": {
            target_os: "windows",
            target_cpu: "x86",
            build_cpu: "x64",
            dependencies: ["devkit", "freetype"],
            configure_args: concat(common.configure_args_32bit),
        }
    };
    // Add the base settings to all the main profiles
    common.main_profile_names.forEach(function (name) {
        profiles[name] = concatObjects(common.main_profile_base, profiles[name]);
    });

    // Generate debug versions of all the main profiles
    common.main_profile_names.forEach(function (name) {
        var debugName = name + common.debug_suffix;
        profiles[debugName] = concatObjects(profiles[name],
                                            common.debug_profile_base);
    });
    // Generate slowdebug versions of all the main profiles
    common.main_profile_names.forEach(function (name) {
        var debugName = name + common.slowdebug_suffix;
        profiles[debugName] = concatObjects(profiles[name],
                                            common.slowdebug_profile_base);
    });

    // Generate open only profiles for all the main profiles for JPRT and reference
    // implementation builds.
    common.main_profile_names.forEach(function (name) {
        var openName = name + common.open_suffix;
        profiles[openName] = concatObjects(profiles[name],
                                           common.open_profile_base);
    });
    // The open only profiles on linux are used for reference builds and should
    // produce the compact profile images by default. This adds "profiles" as an
    // extra default target.
    var openOnlyProfilesExtra = {
        "linux-x86-open": {
            default_make_targets: "profiles",
            configure_args: "--with-jvm-variants=client,server"
        }
    };
    profiles = concatObjects(profiles, openOnlyProfilesExtra);

    // Generate debug profiles for the open only profiles
    common.main_profile_names.forEach(function (name) {
        var openName = name + common.open_suffix;
        var openDebugName = openName + common.debug_suffix;
        profiles[openDebugName] = concatObjects(profiles[openName],
                                                common.debug_profile_base);
    });

    // Profiles for building the zero jvm variant. These are used for verification
    // in JPRT.
    var zeroProfiles = {
        "linux-x64-zero": {
            target_os: "linux",
            target_cpu: "x64",
            dependencies: ["devkit"],
            configure_args: [
                "--with-zlib=system",
                "--with-jvm-variants=zero",
                "--enable-libffi-bundling"
            ]
        },

        "linux-x86-zero": {
            target_os: "linux",
            target_cpu: "x86",
            build_cpu: "x64",
            dependencies: ["devkit"],
            configure_args:  concat(common.configure_args_32bit, [
                "--with-zlib=system",
                "--with-jvm-variants=zero",
                "--enable-libffi-bundling"
            ])
        }
    }
    profiles = concatObjects(profiles, zeroProfiles);

    // Add the base settings to the zero profiles and generate debug profiles
    Object.keys(zeroProfiles).forEach(function (name) {
        var debugName = name + common.debug_suffix;
        profiles[name] = concatObjects(common.main_profile_base, profiles[name]);
        profiles[debugName] = concatObjects(profiles[name], common.debug_profile_base);
    });

    // Profiles used to run tests. Used in JPRT and Mach 5.
    var testOnlyProfiles = {
        "run-test-jprt": {
            target_os: input.build_os,
            target_cpu: input.build_cpu,
            dependencies: [ "jtreg", "gnumake", "boot_jdk" ],
            labels: "test",
            environment: {
                "JT_JAVA": common.boot_jdk_home
            }
        },

        "run-test": {
            target_os: input.build_os,
            target_cpu: input.build_cpu,
            dependencies: [ "jtreg", "gnumake", "boot_jdk" ],
            labels: "test",
            environment: {
                "JT_JAVA": common.boot_jdk_home
            }
        }
    };
    profiles = concatObjects(profiles, testOnlyProfiles);

    // Profiles used to run tests using Jib for internal dependencies.
    var testedProfile = input.testedProfile;
    if (testedProfile == null) {
        testedProfile = input.build_os + "-" + input.build_cpu;
    }
    var testOnlyProfilesPrebuilt = {
        "run-test-prebuilt": {
            src: "src.conf",
            dependencies: [ "jtreg", "gnumake", testedProfile + ".jdk",
                testedProfile + ".test", "src.full"
            ],
            work_dir: input.get("src.full", "install_path") + "/test",
            environment: {
                "PRODUCT_HOME": input.get(testedProfile + ".jdk", "home_path"),
                "TEST_IMAGE_DIR": input.get(testedProfile + ".test", "home_path"),
                "TEST_OUTPUT_DIR": input.src_top_dir
            },
            labels: "test"
        }
    };
    // If actually running the run-test-prebuilt profile, verify that the input
    // variable is valid and if so, add the appropriate target_* values from
    // the tested profile.
    if (input.profile == "run-test-prebuilt") {
        if (profiles[testedProfile] == null) {
            error("testedProfile is not defined: " + testedProfile);
        } else {
            testOnlyProfilesPrebuilt["run-test-prebuilt"]["target_os"]
                = profiles[testedProfile]["target_os"];
            testOnlyProfilesPrebuilt["run-test-prebuilt"]["target_cpu"]
                = profiles[testedProfile]["target_cpu"];
        }
    }
    profiles = concatObjects(profiles, testOnlyProfilesPrebuilt);

    //
    // Define artifacts for profiles
    //
    // Macosx bundles are named osx and Windows demo bundles use zip instead of
    // tar.gz.
    var artifactData = {
        "linux-x64": {
            platform: "linux-x64",
            demo_ext: "tar.gz"
        },
        "linux-x86": {
            platform: "linux-x86",
            demo_ext: "tar.gz"
        },
        "macosx-x64": {
            platform: "osx-x64",
            demo_ext: "tar.gz"
        },
        "solaris-x64": {
            platform: "solaris-x64",
            demo_ext: "tar.gz"
        },
        "solaris-sparcv9": {
            platform: "solaris-sparcv9",
            demo_ext: "tar.gz"
        },
        "windows-x64": {
            platform: "windows-x64",
            demo_ext: "zip"
        },
        "windows-x86": {
            platform: "windows-x86",
            demo_ext: "zip"
        }
    }
    // Generate common artifacts for all main profiles
    common.main_profile_names.forEach(function (name) {
        profiles[name] = concatObjects(profiles[name],
            common.main_profile_artifacts(artifactData[name].platform, artifactData[name].demo_ext));
    });

    // Generate common artifacts for all debug profiles
    common.main_profile_names.forEach(function (name) {
        var debugName = name + common.debug_suffix;
        profiles[debugName] = concatObjects(profiles[debugName],
            common.debug_profile_artifacts(artifactData[name].platform));
    });

    // Extra profile specific artifacts
    profilesArtifacts = {
        "linux-x64": {
            artifacts: {
                doc_api_spec: {
                    local: "bundles/\\(jdk.*doc-api-spec.tar.gz\\)",
                    remote: [
                        "bundles/common/jdk-" + data.version + "_doc-api-spec.tar.gz",
                        "bundles/linux-x64/\\1"
                    ],
                },
            }
        },

        "linux-x64-open": {
            artifacts: {
                jdk: {
                    local: "bundles/\\(jdk.*bin.tar.gz\\)",
                    remote: "bundles/openjdk/GPL/linux-x64/\\1",
                },
                jre: {
                    local: "bundles/\\(jre.*bin.tar.gz\\)",
                    remote: "bundles/openjdk/GPL/linux-x64/\\1",
                },
                test: {
                    local: "bundles/\\(jdk.*bin-tests.tar.gz\\)",
                    remote: "bundles/openjdk/GPL/linux-x64/\\1",
                },
                jdk_symbols: {
                    local: "bundles/\\(jdk.*bin-symbols.tar.gz\\)",
                    remote: "bundles/openjdk/GPL/linux-x64/\\1",
                },
                jre_symbols: {
                    local: "bundles/\\(jre.*bin-symbols.tar.gz\\)",
                    remote: "bundles/openjdk/GPL/linux-x64/\\1",
                },
                demo: {
                    local: "bundles/\\(jdk.*demo.tar.gz\\)",
                    remote: "bundles/openjdk/GPL/linux-x64/\\1",
                },
                doc_api_spec: {
                    local: "bundles/\\(jdk.*doc-api-spec.tar.gz\\)",
                    remote: "bundles/openjdk/GPL/linux-x64/\\1",
                },
            }
        },

        "linux-x86-open": {
            artifacts: {
                jdk: {
                    local: "bundles/\\(jdk.*bin.tar.gz\\)",
                    remote: "bundles/openjdk/GPL/profile/linux-x86/\\1",
                },
                jre: {
                    local: "bundles/\\(jre.*[0-9]_linux-x86_bin.tar.gz\\)",
                    remote: "bundles/openjdk/GPL/profile/linux-x86/\\1",
                },/* The build does not create these
                jre_compact1: {
                    local: "bundles/\\(jre.*-compact1_linux-x86_bin.tar.gz\\)",
                    remote: "bundles/openjdk/GPL/profile/linux-x86/\\1",
                },
                jre_compact2: {
                    local: "bundles/\\(jre.*-compact2_linux-x86_bin.tar.gz\\)",
                    remote: "bundles/openjdk/GPL/profile/linux-x86/\\1",
                },
                jre_compact3: {
                    local: "bundles/\\(jre.*-compact3_linux-x86_bin.tar.gz\\)",
                    remote: "bundles/openjdk/GPL/profile/linux-x86/\\1",
                },*/
            }
        },

        "windows-x86-open": {
            artifacts: {
                jdk: {
                    local: "bundles/\\(jdk.*bin.tar.gz\\)",
                    remote: "bundles/openjdk/GPL/windows-x86/\\1",
                },
                jre: {
                    local: "bundles/\\(jre.*bin.tar.gz\\)",
                    remote: "bundles/openjdk/GPL/windows-x86/\\1"
                },
                test: {
                    local: "bundles/\\(jdk.*bin-tests.tar.gz\\)",
                    remote: "bundles/openjdk/GPL/windows-x86/\\1",
                },
                jdk_symbols: {
                    local: "bundles/\\(jdk.*bin-symbols.tar.gz\\)",
                    remote: "bundles/openjdk/GPL/windows-x86/\\1"
                },
                jre_symbols: {
                    local: "bundles/\\(jre.*bin-symbols.tar.gz\\)",
                    remote: "bundles/openjdk/GPL/windows-x86/\\1",
                },
                demo: {
                    local: "bundles/\\(jdk.*demo.zip\\)",
                    remote: "bundles/openjdk/GPL/windows-x86/\\1",
                }
            }
        },

        "linux-x86-open-debug": {
            artifacts: {
                jdk: {
                    local: "bundles/\\(jdk.*bin-debug.tar.gz\\)",
                    remote: "bundles/openjdk/GPL/profile/linux-x86/\\1",
                },
                jre: {
                    local: "bundles/\\(jre.*bin-debug.tar.gz\\)",
                    remote: "bundles/openjdk/GPL/profile/linux-x86/\\1",
                },
                jdk_symbols: {
                    local: "bundles/\\(jdk.*bin-debug-symbols.tar.gz\\)",
                    remote: "bundles/openjdk/GPL/profile/linux-x86/\\1",
                },
            }
        },

    };
    profiles = concatObjects(profiles, profilesArtifacts);


    // Define the reference implementation profiles. These are basically the same
    // as the open profiles, but upload artifacts to a different location and
    // are only defined for specific platforms.
    profiles["linux-x64-ri"] = clone(profiles["linux-x64-open"]);
    profiles["linux-x86-ri"] = clone(profiles["linux-x86-open"]);
    profiles["linux-x86-ri-debug"] = clone(profiles["linux-x86-open-debug"]);
    profiles["windows-x86-ri"] = clone(profiles["windows-x86-open"]);

    // Generate artifacts for ri profiles
    [ "linux-x64-ri", "linux-x86-ri", "linux-x86-ri-debug", "windows-x86-ri" ]
        .forEach(function (name) {
            // Rewrite all remote dirs to "bundles/openjdk/BCL/..."
            for (artifactName in profiles[name].artifacts) {
                var artifact = profiles[name].artifacts[artifactName];
                artifact.remote = replaceAll("\/GPL\/", "/BCL/",
                    (artifact.remote != null ? artifact.remote : artifact.local));
            }
        });

    // Generate the missing platform attributes
    profiles = generatePlatformAttributes(profiles);
    profiles = generateDefaultMakeTargetsConfigureArg(common, profiles);
    return profiles;
};

/**
 * Generate the dependencies part of the configuration
 *
 * @param input External data to use for generating the configuration
 * @param common The common values
 * @returns {{}} Dependencies part of configuration
 */
var getJibProfilesDependencies = function (input, common) {

    var boot_jdk_platform = input.build_os + "-"
        + (input.build_cpu == "x86" ? "i586" : input.build_cpu);

    var devkit_platform_revisions = {
        linux_x64: "gcc4.9.2-OEL6.4+1.1",
        macosx_x64: "Xcode6.3-MacOSX10.9+1.0",
        solaris_x64: "SS12u4-Solaris11u1+1.0",
        solaris_sparcv9: "SS12u4-Solaris11u1+1.0",
        windows_x64: "VS2013SP4+1.0"
    };

    var devkit_platform = (input.target_cpu == "x86"
        ? input.target_os + "_x64"
        : input.target_platform);

    var dependencies = {

        boot_jdk: {
            server: "javare",
            module: "jdk",
            revision: common.boot_jdk_revision,
            checksum_file: boot_jdk_platform + "/MD5_VALUES",
            file: boot_jdk_platform + "/jdk-" + common.boot_jdk_revision
                + "-" + boot_jdk_platform + ".tar.gz",
            configure_args: "--with-boot-jdk=" + common.boot_jdk_home,
            environment_path: common.boot_jdk_home
        },

        devkit: {
            organization: common.organization,
            ext: "tar.gz",
            module: "devkit-" + devkit_platform,
            revision: devkit_platform_revisions[devkit_platform]
        },

        build_devkit: {
            organization: common.organization,
            ext: "tar.gz",
            module: "devkit-" + input.build_platform,
            revision: devkit_platform_revisions[input.build_platform]
        },

        cups: {
            organization: common.organization,
            ext: "tar.gz",
            revision: "1.0118+1.0"
        },

        jtreg: {
            server: "javare",
            revision: "4.2",
            build_number: "b04",
            checksum_file: "MD5_VALUES",
            file: "jtreg_bin-4.2.zip",
            environment_name: "JT_HOME",
            environment_path: input.get("jtreg", "install_path") + "/jtreg/bin"
        },

        gnumake: {
            organization: common.organization,
            ext: "tar.gz",
            revision: "4.0+1.0",

            module: (input.build_os == "windows"
                ? "gnumake-" + input.build_osenv_platform
                : "gnumake-" + input.build_platform),

            configure_args: (input.build_os == "windows"
                ? "MAKE=" + input.get("gnumake", "install_path") + "/cygwin/bin/make"
                : "MAKE=" + input.get("gnumake", "install_path") + "/bin/make"),

            environment_path: (input.build_os == "windows"
                ? input.get("gnumake", "install_path") + "/cygwin/bin"
                : input.get("gnumake", "install_path") + "/bin")
        },

        freetype: {
            organization: common.organization,
            ext: "tar.gz",
            revision: "2.3.4+1.0",
            module: "freetype-" + input.target_platform
        }
    };

    return dependencies;
};

/**
 * Generate the missing platform attributes for profiles
 *
 * @param profiles Profiles map to generate attributes on
 * @returns {{}} New profiles map with platform attributes fully filled in
 */
var generatePlatformAttributes = function (profiles) {
    var ret = concatObjects(profiles, {});
    for (var profile in profiles) {
        if (ret[profile].build_os == null) {
            ret[profile].build_os = ret[profile].target_os;
        }
        if (ret[profile].build_cpu == null) {
            ret[profile].build_cpu = ret[profile].target_cpu;
        }
        ret[profile].target_platform = ret[profile].target_os + "_" + ret[profile].target_cpu;
        ret[profile].build_platform = ret[profile].build_os + "_" + ret[profile].build_cpu;
    }
    return ret;
};

/**
 * The default_make_targets attribute on a profile is not a real Jib attribute.
 * This function rewrites that attribute into the corresponding configure arg.
 * Calling this function multiple times on the same profiles object is safe.
 *
 * @param common Common values
 * @param profiles Profiles map to rewrite profiles for
 * @returns {{}} New map of profiles with the make targets converted
 */
var generateDefaultMakeTargetsConfigureArg = function (common, profiles) {
    var ret = concatObjects(profiles, {});
    for (var profile in ret) {
        if (ret[profile]["default_make_targets"] != null) {
            var targetsString = concat(ret[profile].default_make_targets).join(" ");
            // Iterate over all configure args and see if --with-default-make-target
            // is already there and change it, otherwise add it.
            var found = false;
            for (var i in ret[profile].configure_args) {
                var arg = ret[profile].configure_args[i];
                if (arg != null && arg.startsWith("--with-default-make-target=")) {
                    found = true;
                    ret[profile].configure_args[i]
                        = "--with-default-make-target=" + targetsString;
                }
            }
            if (!found) {
                ret[profile].configure_args = concat(
                    ret[profile].configure_args,
                    "--with-default-make-target=" + targetsString);
            }
        }
    }
    return ret;
}

var getBuildId = function (input) {
    if (input.build_id != null) {
        return input.build_id;
    } else {
        var topdir = new java.io.File(__DIR__, "../..").getCanonicalFile().getName();
        var userName = java.lang.System.getProperty("user.name");
        return userName + "." + topdir;
    }
}

/**
 * Deep clones an object tree.
 *
 * @param o Object to clone
 * @returns {{}} Clone of o
 */
var clone = function (o) {
    return JSON.parse(JSON.stringify(o));
};

/**
 * Concatenates all arguments into a new array
 *
 * @returns {Array.<T>} New array containing all arguments
 */
var concat = function () {
    return Array.prototype.concat.apply([], arguments);
};

/**
 * Takes a String or Array of Strings and does a replace operation on each
 * of them.
 *
 * @param pattern Pattern to look for
 * @param replacement Replacement text to insert
 * @param a String or Array of Strings to replace
 * @returns {Array} Either a new array or a new string depending on the input
 */
var replaceAll = function (pattern, replacement, a) {
    // If a is an array
    if (Array === a.constructor) {
    var newA = [];
    for (var i in a) {
            newA.push(a[i].replace(pattern, replacement));
        }
        return newA;
        } else {
        return a.replace(pattern, replacement);
    }
};

/**
 * Deep concatenation of two objects. For each node encountered, merge
 * the contents with the corresponding node in the other object tree,
 * treating all strings as array elements.
 *
 * @param o1 Object to concatenate
 * @param o2 Object to concatenate
 * @returns {{}} New object tree containing the concatenation of o1 and o2
 */
var concatObjects = function (o1, o2) {
    if (o1 == null) {
        return clone(o2);
    }
    if (o2 == null) {
        return clone(o1);
    }
    var ret = {};
    for (var a in o1) {
        if (o2[a] == null) {
            ret[a] = clone(o1[a]);
        }
    }
    for (var a in o2) {
        if (o1[a] == null) {
            ret[a] = clone(o2[a]);
        } else {
            if (typeof o1[a] == 'string') {
                ret[a] = clone([o1[a]].concat(o2[a]));
            } else if (Array.isArray(o1[a])) {
                ret[a] = clone(o1[a].concat(o2[a]));
            } else if (typeof o1[a] == 'object') {
                ret[a] = concatObjects(o1[a], o2[a]);
            }
        }
    }
    return ret;
};

/**
 * Constructs the numeric version string from reading the
 * common/autoconf/version-numbers file and removing all trailing ".0".
 *
 * @param major Override major version
 * @param minor Override minor version
 * @param security Override security version
 * @param patch Override patch version
 * @returns {String} The numeric version string
 */
var getVersion = function (major, minor, security, patch) {
    var version_numbers = getVersionNumbers();
    var version = (major != null ? major : version_numbers.get("DEFAULT_VERSION_MAJOR"))
        + "." + (minor != null ? minor : version_numbers.get("DEFAULT_VERSION_MINOR"))
        + "." + (security != null ? security :  version_numbers.get("DEFAULT_VERSION_SECURITY"))
        + "." + (patch != null ? patch : version_numbers.get("DEFAULT_VERSION_PATCH"));
    while (version.match(".*\.0$")) {
        version = version.substring(0, version.length - 2);
    }
    return version;
};

// Properties representation of the common/autoconf/version-numbers file. Lazily
// initiated by the function below.
var version_numbers;

/**
 * Read the common/autoconf/version-numbers file into a Properties object.
 *
 * @returns {java.utilProperties}
 */
var getVersionNumbers = function () {
    // Read version information from common/autoconf/version-numbers
    if (version_numbers == null) {
        version_numbers = new java.util.Properties();
        var stream = new java.io.FileInputStream(__DIR__ + "/../../common/autoconf/version-numbers");
        version_numbers.load(stream);
        stream.close();
    }
    return version_numbers;
}
