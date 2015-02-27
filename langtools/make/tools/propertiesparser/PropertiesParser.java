/*
 * Copyright (c) 2014, Oracle and/or its affiliates. All rights reserved.
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

package propertiesparser;

import propertiesparser.parser.MessageFile;
import propertiesparser.gen.ClassGenerator;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.lang.RuntimeException;
import java.lang.Throwable;
import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Properties;

/** Translates a .properties file into a .java file containing an enum-like Java class
 *  which defines static factory methods for all resource keys in a given resource file. <P>
 *
 *  Usage: java PropertiesParser -compile [path to .properties file] [output folder where .java file will be written]
 *
 * @author mcimadamore
 */

public class PropertiesParser {

    public Logger logger;

    public PropertiesParser(Logger logger) {
        this.logger = logger;
    }

    public static void main(String[] args) {
        PropertiesParser pp = new PropertiesParser(msg -> System.out.println(msg));
        boolean ok = pp.run(args);
        if ( !ok ) {
            System.exit(1);
        }
    }

    public static interface Logger {
        void info(String msg);
    }

    public void info(String msg) {
        logger.info(msg);
    }

    public boolean run(String[] args) {
        Map<String, String> optionsMap = parseOptions(args);
        if (optionsMap.isEmpty()) {
            usage();
            return false;
        }
        try {
            optionsMap.forEach((propfile, outfile) -> compilePropertyFile(propfile, outfile));
            return true;
        } catch (RuntimeException ex) {
            ex.printStackTrace();
            return false;
        }
    }

    private void compilePropertyFile(String propertyPath, String outPath) {
        try {
            File propertyFile = new File(propertyPath);
            String prefix = propertyFile.getName().split("\\.")[0];
            MessageFile messageFile = new MessageFile(propertyFile, prefix);
            new ClassGenerator().generateFactory(messageFile, new File(outPath));
        } catch (Throwable ex) {
            throw new RuntimeException(ex);
        }
    }

    private Map<String, String> parseOptions(String args[]) {
        Map<String, String> optionsMap = new HashMap<>(args.length);
        for ( int i = 0; i < args.length ; i++ ) {
            if ( "-compile".equals(args[i]) && i+2 < args.length ) {
                optionsMap.put(args[++i], args[++i]);
            } else {
                return new HashMap<>();
            }
        }
        return optionsMap;
    }

    private void usage() {
        info("usage:");
        info("    java PropertiesParser {-compile path_to_properties_file path_to_java_output_dir}");
        info("");
        info("Example:");
        info("    java PropertiesParser -compile resources/test.properties resources");
    }
}